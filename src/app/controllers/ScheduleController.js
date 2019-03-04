const { Appointment, User } = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')

class ScheduleController {
  async index (req, res) {
    const appointments = await Appointment.findAll({
      include: [{ model: User, as: 'user' }],
      where: {
        provider_id: req.session.user.id,
        date: {
          [Op.between]: [
            moment()
              .add(1, 'days')
              .startOf('day')
              .format(),
            moment()
              .add(1, 'days')
              .endOf('day')
              .format()
          ]
        }
      }
    })

    return res.render('schedule/index', { appointments })
  }
}

module.exports = new ScheduleController()
