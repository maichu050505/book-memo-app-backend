const express = require("express");

const getPersonalReview = require("./getPersonalReview");
const createOrUpdateReview = require("./createOrUpdateReview");
const deleteReview = require("./deleteReview");
const updateReview = require("./updateReview");
const getAllReviews = require("./getAllReviews");
const getAverageRating = require("./getAverageRating");
const getReviewCount = require("./getReviewsCount");

const router = express.Router();

// 各エンドポイントを統合
router.use(getPersonalReview);
router.use(createOrUpdateReview);
router.use(deleteReview);
router.use(updateReview);
router.use(getAllReviews);
router.use(getAverageRating);
router.use(getReviewCount);

module.exports = router;
