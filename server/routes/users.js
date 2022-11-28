const router = require('express').Router();
const {
  models: { User },
} = require('../db');
const { INTEGER } = require('sequelize');


/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:

router.get(`/unassigned`, async (req, res, next) => {
  const students = await User.findUnassignedStudents()
    res.send(students);
  })

router.get(`/teachers`, async (req, res, next) => {
  const teachers = await User.findTeachersAndMentees()
    res.send(teachers);
  })

router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id,
      },
    })
    // responds with 404 if the user does not exist
    if (!user) {
      return res.sendStatus(404)
    }
    // deletes an existing user by their id and responds with 204
    await user.destroy()
    res.sendStatus(204)
    // responds with 400 if the id is not a number
  } catch (err) {
    if (req.params.id !== INTEGER) {
      return res.sendStatus(400)
    }
    next(err)
  }
});

router.post("/", async (req, res, next) => {
  // need to use findOrCreate() method??
  try {
    const newName = await User.create(req.body);
    res.send(newName)
    res.sendStatus(201)
  } catch (error) {
    next(error)
  }
})

// router.put('/:id', (req, res, next) => {
//   if (User.Id) {
//     let err = new Error();
//     err.status = 404;
//     throw err;
//   }
//   res.sendStatus(200).send({
//     name: 'Eddie'
//   })
// })


module.exports = router;
