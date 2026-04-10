const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Analysis = sequelize.define("Analyses", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  jobDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  matchScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  matchLevel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  fullResults: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
});

module.exports = Analysis;
