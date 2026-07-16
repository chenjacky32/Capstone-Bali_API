import { customAlphabet } from 'nanoid';
import destinationModel from '../models/DestinationModel.js';
import avgRatingHelper from '../utils/AvgRating.js';

class DestinationService {
  constructor() {
    this.generateId = customAlphabet(
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      10,
    );
  }

  async addDestination({ name, description, img, location }) {
    if (!name || !description || !img || !location) {
      throw new Error('Please fill all the fields');
    }

    const dataDest = await destinationModel.findByName(name);
    if (dataDest.length > 0) {
      throw new Error('Destination Already Exist');
    }

    const id = this.generateId();
    await destinationModel.create({
      dest_id: id,
      name_dest: name,
      description,
      img,
      location,
    });

    return {
      id,
      name,
      description,
      img,
      location,
    };
  }

  async getDestinationById(id) {
    const dest = await destinationModel.findUnique(id);
    if (!dest) {
      throw new Error('Destination not found');
    }

    return await avgRatingHelper.calculate(dest);
  }

  async deleteDestinationById(id) {
    const dataDest = await destinationModel.findMany(id);
    if (dataDest.length === 0) {
      throw new Error('Destination not found');
    }

    await destinationModel.deleteMany(id);
    return {
      id: dataDest[0].dest_id,
    };
  }

  async getAllDestinations() {
    const destinations = await destinationModel.findAll();
    return await Promise.all(destinations.map(avgRatingHelper.calculate));
  }
}

export default new DestinationService();
