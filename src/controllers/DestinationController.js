import destinationService from '../services/DestinationService.js';
import responseHelper from '../utils/ResponseHelper.js';

class DestinationController {
  addDestination = async (req, res) => {
    try {
      // Auth token checked in route pre handler
      const data = await destinationService.addDestination(req.payload);
      return responseHelper.success(
        res,
        201,
        'Destination Created successfully',
        data,
      );
    } catch (error) {
      if (
        error.message === 'Please fill all the fields' ||
        error.message === 'Destination Already Exist'
      ) {
        return responseHelper.error(res, 400, error.message);
      }
      return responseHelper.error(res, 500, 'internal server error');
    }
  };

  getDestinationById = async (req, res) => {
    const { id } = req.params;
    try {
      const data = await destinationService.getDestinationById(id);
      return responseHelper.success(
        res,
        200,
        'Get Destinations by id success',
        data,
      );
    } catch (error) {
      if (error.message === 'Destination not found') {
        return responseHelper.error(res, 404, error.message);
      }
      return responseHelper.error(res, 500, 'internal server error');
    }
  };

  deleteDestinationById = async (req, res) => {
    const { id } = req.params;
    try {
      // Auth token checked in route pre handler
      const data = await destinationService.deleteDestinationById(id);
      return responseHelper.success(
        res,
        200,
        'Destination has been deleted',
        data,
      );
    } catch (error) {
      if (error.message === 'Destination not found') {
        return responseHelper.error(res, 404, error.message);
      }
      return responseHelper.error(res, 500, 'internal server error');
    }
  };

  getAllDestinations = async (req, res) => {
    try {
      const data = await destinationService.getAllDestinations();
      return responseHelper.success(res, 200, 'Get All Destination success', {
        destinations: data,
      });
    } catch (error) {
      return responseHelper.error(res, 500, 'internal server error');
    }
  };
}

export default new DestinationController();
