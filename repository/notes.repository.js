const Notes = require('../models').Note;
const { Op } = require('sequelize');

module.exports = {

    all() {
        return Notes.findAll();
    },

    retrieve(id){
        return Notes.findByPk(id);
    },

    create(new_note){
        return Notes.create(new_note);
    },

    update(note, update_note){
        return note.update(update_note);
    },
};