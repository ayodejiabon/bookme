const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const APIFeatures = require('./../utils/APIFeatures');

exports.deleteOne = Model => catchAsync( async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new appError('No document found', 404));
    }
    res.status(204).json({});
});

//do not update passwords with handler functions

exports.updateOne = Model => catchAsync( async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true
    });
    if (!doc) {
        return next(new appError('No document found', 404));
    }
    res.status(200).json({
        status: "success",
        data:{
            doc
        }
    })
});

exports.createOne = Model => catchAsync( async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: "success",
        data:{
            data: doc
        }
    })
});

exports.getOne = (Model, popOptions) => catchAsync( async (req, res, next) => {
    
    let query = Model.findByIdAndUpdate(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
        return next(new appError('No document found', 404));
    }

    res.status(200).json({
        status: "success",
        data:{
            doc
        }
    })
});

exports.getAll = Model => catchAsync( async (req, res) => {

    //to allow for nested review in tours
    let filter = {};

    if (req.params.tourId) filter = {tour:req.params.tourId}

    const features = new APIFeatures(Model.find(), req.query).filter().sort().limitFields().paginate();
    const doc = await features.query;

    res.status(200).json({
        status: "success",
        result: doc.length,
        data:{
            doc
        }
    })
})