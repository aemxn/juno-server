const express = require('express');
const router = express.Router();
const controller = require('../controllers/entries.controller')

router.get('/groupByYear', controller.groupByYear);
router.get('/explore', controller.explore);
router.get('/explore/month', controller.exploreMonth);
router.get('/find-title', controller.findTitle);
router.get('/latest', controller.latest);
router.get('/export', controller.exportAll);
router.get('/:id', controller.retrieve);

router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;