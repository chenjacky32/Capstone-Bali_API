import destinationModel from '../models/DestinationModel.js';
import ratingService from './RatingService.js';
import { generateId } from '../utils/IdGenerator.js';

class DestinationService {
  async addDestination({ name, description, img, location }) {
    if (!name || !description || !img || !location) {
      throw new Error('Please fill all the fields');
    }

    const dataDest = await destinationModel.findByName(name);
    if (dataDest.length > 0) {
      throw new Error('Destination Already Exist');
    }

    const id = generateId();
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

    return await ratingService.calculateRating(dest);
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
    return await Promise.all(destinations.map(ratingService.calculateRating));
  }
}

export default new DestinationService();
