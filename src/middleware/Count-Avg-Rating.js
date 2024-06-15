import prisma from '../db/prisma.js';

const CountAvgRating = async (dest) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: {
        dest_id: dest.dest_id,
      },
    });
    const totalRating = ratings.length;
    const sumRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const avgRating = totalRating ? sumRating / totalRating : 0;
    const roundedRating = parseFloat(avgRating.toFixed(1));
    return {
      id: dest.dest_id,
      name: dest.name_dest,
      description: dest.description,
      img: dest.img,
      location: dest.location,
      avgRating: roundedRating,
    };
  } catch (error) {
    console.error(error.message);
  }
};

export default CountAvgRating;
