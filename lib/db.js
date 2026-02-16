import { sql } from '@vercel/postgres';

export async function initDatabase() {
  try {
    // Створюємо таблицю альтанок
    await sql`
      CREATE TABLE IF NOT EXISTS gazebos (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Створюємо таблицю бронювань
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        gazebo_id INTEGER REFERENCES gazebos(id),
        user_id BIGINT NOT NULL,
        username VARCHAR(100),
        first_name VARCHAR(100) NOT NULL,
        house_number VARCHAR(20) NOT NULL,
        apartment_number VARCHAR(20) NOT NULL,
        phone_number VARCHAR(20),
        booking_date DATE NOT NULL,
        time_slot VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(gazebo_id, booking_date, time_slot)
      );
    `;

    // Створюємо таблицю відгуків
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        username VARCHAR(100),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Створюємо таблицю підписок на слоти
    await sql`
      CREATE TABLE IF NOT EXISTS slot_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        username VARCHAR(100),
        first_name VARCHAR(100) NOT NULL,
        booking_date DATE NOT NULL,
        time_slot VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, booking_date, time_slot)
      );
    `;

    // Додаємо 3 альтанки, якщо їх ще немає
    const { rows } = await sql`SELECT COUNT(*) as count FROM gazebos`;
    if (rows[0].count === '0') {
      await sql`
        INSERT INTO gazebos (name) VALUES 
        ('Альтанка 1'),
        ('Альтанка 2'),
        ('Альтанка 3');
      `;
    }

    return { success: true };
  } catch (error) {
    console.error('Database init error:', error);
    throw error;
  }
}

export async function getGazebos() {
  const { rows } = await sql`
    SELECT * FROM gazebos ORDER BY id;
  `;
  return rows;
}

export async function getBookings(date) {
  const { rows } = await sql`
    SELECT b.*, g.name as gazebo_name 
    FROM bookings b
    JOIN gazebos g ON b.gazebo_id = g.id
    WHERE b.booking_date = ${date}
    ORDER BY b.gazebo_id, b.time_slot;
  `;
  return rows;
}

export async function createBooking(data) {
  const {
    gazeboId,
    userId,
    username,
    firstName,
    houseNumber,
    apartmentNumber,
    phoneNumber,
    bookingDate,
    timeSlot,
  } = data;

  try {
    // Перевіряємо, скільки бронювань вже є у користувача
    const { rows: existingBookings } = await sql`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE user_id = ${userId} AND booking_date >= CURRENT_DATE;
    `;
    
    if (parseInt(existingBookings[0].count) >= 3) {
      throw new Error('Ви досягли ліміту: максимум 3 активних бронювання');
    }

    const { rows } = await sql`
      INSERT INTO bookings (
        gazebo_id, user_id, username, first_name,
        house_number, apartment_number, phone_number,
        booking_date, time_slot
      ) VALUES (
        ${gazeboId}, ${userId}, ${username}, ${firstName},
        ${houseNumber}, ${apartmentNumber}, ${phoneNumber},
        ${bookingDate}, ${timeSlot}
      )
      RETURNING *;
    `;
    return rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Цей слот вже зайнятий');
    }
    throw error;
  }
}

export async function getUserBookings(userId, date) {
  const { rows } = await sql`
    SELECT b.*, g.name as gazebo_name 
    FROM bookings b
    JOIN gazebos g ON b.gazebo_id = g.id
    WHERE b.user_id = ${userId} AND b.booking_date = ${date};
  `;
  return rows;
}

export async function getAllUserBookings(userId) {
  const { rows } = await sql`
    SELECT b.*, g.name as gazebo_name 
    FROM bookings b
    JOIN gazebos g ON b.gazebo_id = g.id
    WHERE b.user_id = ${userId}
    ORDER BY b.booking_date DESC, b.time_slot;
  `;
  return rows;
}

export async function deleteBooking(bookingId, userId) {
  // Спочатку отримуємо дані бронювання з назвою альтанки
  const { rows: bookingData } = await sql`
    SELECT b.*, g.name as gazebo_name
    FROM bookings b
    JOIN gazebos g ON b.gazebo_id = g.id
    WHERE b.id = ${bookingId} AND b.user_id = ${userId};
  `;

  if (bookingData.length === 0) {
    return null;
  }

  // Тепер видаляємо
  await sql`
    DELETE FROM bookings
    WHERE id = ${bookingId} AND user_id = ${userId};
  `;

  return bookingData[0];
}

export async function saveFeedback(data) {
  const { userId, username, firstName, lastName, message } = data;

  const { rows } = await sql`
    INSERT INTO feedback (user_id, username, first_name, last_name, message)
    VALUES (${userId}, ${username}, ${firstName}, ${lastName}, ${message})
    RETURNING *;
  `;
  return rows[0];
}

// ============================================
// Функції для роботи з підписками на слоти
// ============================================

// Створити підписку на слот
export async function createSlotSubscription(data) {
  const { userId, username, firstName, bookingDate, timeSlot } = data;

  try {
    // Перевіряємо кількість активних підписок користувача
    const { rows: existingSubs } = await sql`
      SELECT COUNT(*) as count
      FROM slot_subscriptions
      WHERE user_id = ${userId} AND booking_date >= CURRENT_DATE;
    `;

    if (parseInt(existingSubs[0].count) >= 5) {
      throw new Error('Ви досягли ліміту: максимум 5 активних підписок');
    }

    const { rows } = await sql`
      INSERT INTO slot_subscriptions (user_id, username, first_name, booking_date, time_slot)
      VALUES (${userId}, ${username}, ${firstName}, ${bookingDate}, ${timeSlot})
      RETURNING *;
    `;
    return rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Ви вже підписані на цей слот');
    }
    throw error;
  }
}

// Видалити підписку
export async function deleteSlotSubscription(subscriptionId, userId) {
  const { rows } = await sql`
    DELETE FROM slot_subscriptions
    WHERE id = ${subscriptionId} AND user_id = ${userId}
    RETURNING *;
  `;
  return rows.length > 0 ? rows[0] : null;
}

// Отримати всі підписки користувача
export async function getUserSlotSubscriptions(userId) {
  const { rows } = await sql`
    SELECT * FROM slot_subscriptions
    WHERE user_id = ${userId} AND booking_date >= CURRENT_DATE
    ORDER BY booking_date, time_slot;
  `;
  return rows;
}

// Отримати всіх підписників на конкретний слот
export async function getSlotSubscribers(bookingDate, timeSlot) {
  const { rows } = await sql`
    SELECT * FROM slot_subscriptions
    WHERE booking_date = ${bookingDate} AND time_slot = ${timeSlot};
  `;
  return rows;
}

// Видалити всі підписки на конкретний слот (коли слот стає вільним)
export async function deleteSlotSubscriptionsForSlot(bookingDate, timeSlot) {
  await sql`
    DELETE FROM slot_subscriptions
    WHERE booking_date = ${bookingDate} AND time_slot = ${timeSlot};
  `;
}

// Перевірити чи всі 3 альтанки зайняті в слоті
export async function isSlotFullyBooked(bookingDate, timeSlot) {
  const { rows } = await sql`
    SELECT COUNT(*) as count
    FROM bookings
    WHERE booking_date = ${bookingDate} AND time_slot = ${timeSlot};
  `;
  return parseInt(rows[0].count) === 3; // Рівно 3 альтанки в системі
}

// Видалити підписку користувача на слот (коли він сам бронює цей слот)
export async function deleteUserSlotSubscription(userId, bookingDate, timeSlot) {
  await sql`
    DELETE FROM slot_subscriptions
    WHERE user_id = ${userId} AND booking_date = ${bookingDate} AND time_slot = ${timeSlot};
  `;
}

// Видалити всі підписки на минулі дати (для cleanup cron job)
export async function deletePastSlotSubscriptions() {
  const { rows } = await sql`
    DELETE FROM slot_subscriptions
    WHERE booking_date < CURRENT_DATE
    RETURNING *;
  `;
  return rows;
}
