const Sequelize = require('sequelize');
const db = require('./db');


const User = db.define('user', {
  // Add your Sequelize fields here

  name: {
    // name is a string
    type: Sequelize.STRING,
    // name must be unique
    unique: true,
    // name cannot be null
    allowNull: false,
    // name cannot be an empty string
    validate: {
      notEmpty: true
    }
  },

  userType: {
    type: Sequelize.STRING,
    // defaultValue property so it defaults to 'STUDENT'
    defaultValue: 'STUDENT',
    allowNull: false,
    // attempt at 'usertype defaults to STUDENT / TEACHER
    // passes the test but breaks the rest of the code
    // validate: {
    //   contains: ['TEACHER', 'STUDENT']
    // }
  },

  isStudent: {
    // isStudent is virtual (it doesn't appear as a column in the database)
    type: Sequelize.VIRTUAL,
    get() {
      return this.userType == 'STUDENT'
    }
  },

  isTeacher: {
    // isTeacher is virtual (it doesn't appear as a column in the database)
    type: Sequelize.VIRTUAL,
    get() {
      return this.userType == 'TEACHER'
    }
  },

  subject: {
    type: Sequelize.STRING,
  }

});

User.findUnassignedStudents = async () => {
  // User.findUnassignedStudents is a class method
  return await User.findAll({
    // User.findUnassignedStudents returns all students who do not have a mentor
    where: {
      userType: 'STUDENT',
      mentorId: null
    }
  })
}

User.findTeachersAndMentees = async () => {
  // User.findTeachersAndMentees is a class method
  return await User.findAll({
    // User.findTeachersAndMentees returns all teachers
    where: {
      userType: 'TEACHER'
    },
    // User.findTeachersAndMentees returns all teachers's assigned mentees
    // Use eager loading
    include: {
      model: User,
      as: 'mentees'
    }
  })
}

// cannot update a user with a mentor who is not a TEACHER
// ********* WORK IN PROGRESS *******
User.mentorTeacher = async (user) => {
  const userMentor = await User.findByPk(user.mentorId)
  if (userMentor.isStudent) {
    throw new Error('Mentor must be a TEACHER')
  }
}


// cannot change userType from STUDENT to TEACHER when user has a mentor
// cannot change userType from TEACHER to STUDENT when user has mentees
// ********* WORK IN PROGRESS *******
User.changeStudentTeacher = async (user) => {
  const userMentee = await user.getMentees()
  const userMentor = await user.getMentors()
  if (user.isStudent) {
    throw new Error('Mentor cannot be a student')
  }
  // if user has a mentee, throw error
  if (userMentee.length > 0) {
    throw new Error('User already has a mentor')
  }
  // if user has a mentor, throw error
  if (userMentor.length > 0) {
    throw new Error('User already has a mentee')
  }
}

// User.getPeers = (user) => {
//   const userMentor = user.findByPk(user.mentorId)
//   return userMentor.getMentees()
// }

// User.updatingUser = () => {
//   if (User.mentorId !== 'TEACHER') {
//     throw new Error ("Must be a teacher!")
//   }
// }

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;