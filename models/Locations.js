module.exports = Locations = (sequelize, DataTypes) => {
    const Locations = sequelize.define("Locations", {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      photos_videos: {
        type: DataTypes.BLOB,
        allowNull: false,
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      radius_proximity: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      parent_location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });

    return Locations
};