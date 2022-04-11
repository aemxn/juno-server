const repository = require('../repository/notes.repository');
const util = require('../utils/utils.js');

module.exports = {
    getAll(req, res) {
        return repository.all()
        .then(notes => res.status(200).send(notes))
        .catch(error => res.status(400).send(error));
    },

    retrieve(req, res) {
        return repository.retrieve(req.params.id)
        .then(note => {
            if(!note) {
                return res.status(404).send({ message: 'note Not Found' })
            }
            res.status(200).send(note);
        })
        .catch(error => res.status(400).send(error));
    },

    create(req, res) {
        var new_note = {
            title: req.body.title,
            body: req.body.body
        };

        return repository
            .create(new_note)
            .then(note => res.status(201).send({ message: 'Note created!', data: note }))
            .catch(error => res.status(400).send({ message: 'Create failed. Code: 44', data: error }));
    },

    update(req, res) {
        var update_note = {
            title: req.body.title,
            body: req.body.body,
            is_archive: req.body.is_archive,
            is_deleted: req.body.is_deleted
        };

        repository.retrieve(req.params.id)
            .then(note => {
                if(!note) {
                    return res.status(404).send({ message: 'note Not Found' })
                }
                return repository.update(note, update_note)
                    .then(() => res.status(200).send({ message: 'Update success!' }))
                    .catch((error) => res.status(400).send({ message: 'Update failed', data: error }));
            })
            .catch(error => res.status(400).send({ message: 'Update failed. Code: 43', data: error }));
    }
};