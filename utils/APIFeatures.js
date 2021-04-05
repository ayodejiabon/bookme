class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = {...this.queryString};

        const excludedFields = ['page', 'sort', 'limit', 'fields'];

        excludedFields.forEach(el=>delete queryObj[el]);

        //console.log(this.queryString);

        //advanced filtering 
        let queryStr = JSON.stringify(queryObj);

        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // console.log(JSON.parse(queryStr))

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }
    sort() {
        if(this.queryString.sort !== undefined){
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }else{
            this.query = this.query.sort('-created')
        }

        return this;
    }
    limitFields(){

        if(this.queryString.fields !== undefined){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            //remove v from results
            this.query = this.query.select('-__v');
        }

        return this;
    }
    paginate(){
        const page = this.queryString.page * 1 || 1;

        const limit = this.queryString.limit * 1 || 100;

        const skip = (page - 1)* limit;
        
        this.query = this.query.skip(skip).limit(limit);

        // if(this.queryString.page !== undefined){
        //     const numTours = await Tour.countDocuments();
        //     if (skip >= numTours) throw new Error ('This page does not exist');
        // }

        return this;
    }
}

module.exports = APIFeatures;