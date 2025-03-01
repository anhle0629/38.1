/** User class for message.ly */

const { DB_URI, BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError");



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
    const result = await db.query(`
      INSERT INTO users
      username, password, first_name, last_name, phone, join_at, last_login_at,
      VAlUES($1,$2,$3,$4,$5, current_timestamp, current_timestamp)
      RETURING username, password, first_name, last_name, phone, join_at, last_login_at
      `,[username, hashedPassword, first_name, last_name, phone])
      
    
  
    
    return result.rows[0]
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(`
      SELECT username, password
      FROM user
      WHERE username = $1
      `, [username, password])
    
     const user = result.rows[0]
     return user && bcrypt.compare(password, user.password)
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const result = await db.query(`
      UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username, last_login_at
      `, [username])

    if(!result.rows[0]){
      throw new ExpressError(`${username} has not login in yet`, 404)
    }  

    return result.rows[0]
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(`
      SELECT username, password, first_name, Last_name, phone, join_at, last_login_at
      FROM users
      ORDER BY username`)
    
    return result.rows; 
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(`
      SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1
      `, [username])

    if(result.rows.length === 0){
      throw new ExpressError(`${username}: cannot be found`, 404)
    }
    
    return result.rows[0]
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(`
      SELECT m.id, m.to_user, m.body, m.sent_at, m.read_at,
      u.username, u.first_name, u.last_phone, u.phone, 
      FROM messages AS m 
      JOIN users AS u ON m.to_username = u.username
      WHERE from_usname = $1
      `,[username])
    
      return result.rows.map(m => ({
        id: m.id,
        to_user: {
          username: m.to_username,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at
      }));
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const result = await db.query(`
      SELECT m.id, m.from_user , m.body, m.sent_at, m.read_at
      u.first_name, u.last_name, u.phone,
      FROM messages AS m
      JOIN users AS u ON m.from_username = u.username
      WHERE to_username = $1
      `,[username])
    
      return result.rows.map((m)=>({
        id:m.id,
        from_user:{
          username: m.from_user,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at
      }))
  }

}


module.exports = User;