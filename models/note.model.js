'use strict';
module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define('Note', {
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    is_archive: DataTypes.BOOLEAN,
    is_deleted: DataTypes.BOOLEAN,
  }, {});
  return Note;
};