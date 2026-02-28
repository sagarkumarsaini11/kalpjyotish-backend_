const mongoose = require("mongoose");
const RatingReview = require("../models/RatingReview");

exports.getRatingSummaryForAstros = async (astroIds) => {
  const objectIds = astroIds
    .filter(id => mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id));

  const data = await RatingReview.aggregate([
    { $match: { astrologer: { $in: objectIds } } },

    {
      $group: {
        _id: {
          astrologer: "$astrologer",
          rating: "$rating"
        },
        count: { $sum: 1 }
      }
    },

    {
      $group: {
        _id: "$_id.astrologer",
        stars: {
          $push: {
            rating: "$_id.rating",
            count: "$count"
          }
        },
        totalReviews: { $sum: "$count" },
        weightedSum: {
          $sum: { $multiply: ["$_id.rating", "$count"] }
        }
      }
    },

    {
      $project: {
        _id: 1,
        totalReviews: 1,
        averageRating: {
          $cond: [
            { $eq: ["$totalReviews", 0] },
            0,
            { $round: [{ $divide: ["$weightedSum", "$totalReviews"] }, 1] }
          ]
        },
        stars: {
          $arrayToObject: {
            $map: {
              input: [1, 2, 3, 4, 5],
              as: "s",
              in: {
                k: { $toString: "$$s" },
                v: {
                  $let: {
                    vars: {
                      found: {
                        $first: {
                          $filter: {
                            input: "$stars",
                            cond: { $eq: ["$$this.rating", "$$s"] }
                          }
                        }
                      }
                    },
                    in: { $ifNull: ["$$found.count", 0] }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]);

  // Map by astrologerId
  const map = {};
  data.forEach(d => {
    map[d._id.toString()] = {
      averageRating: d.averageRating,
      totalReviews: d.totalReviews,
      stars: d.stars
    };
  });

  return map;
};
