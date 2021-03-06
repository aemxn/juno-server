const repository = require('../repository/entries.repository');
const util = require('../utils/utils.js');

module.exports = {
    exportAll(req, res) {
        return repository.all()
        .then(entries => {
            let json = { 'entries' : [] };
            for (entry of entries) {
                json.entries.push(entry);
            }
            util.writeToFile(json, function callback(filename, data) {
                data = JSON.parse(data);
                res.status(200).send({
                    'message': 'Successfully exported',
                    'filename': `${filename}`,
                    'length': data.entries.length,
                    'last_row': data.entries[data.entries.length-1]});
            });
        })
        .catch(error => res.status(400).send(error));
    },

    findTitle(req, res) {
        return repository.findTitle(req.body.title)
        .then(entries => res.status(200).send(entries))
        .catch(error => res.status(400).send(error));
    },

    explore(req, res) {
        const { query, page, size, date } = req.query;
        const { limit, offset } = util.getPagination(page, size);
        
        return repository.explore({ query, date, limit, offset })
        .then(entries => {
            const paged = util.getPagingData(entries, page, limit);
            res.status(200).send(paged);
        })
        .catch(error => res.status(400).send(error));
    },

    exploreMonth(req, res) {
        const { page, size, date } = req.query;
        const { limit, offset } = util.getPagination(page, size);
        
        return repository.exploreMonth({ date, limit, offset })
        .then(entries => {
            const paged = util.getPagingData(entries, page, limit);
            res.status(200).send(paged);
        })
        .catch(error => res.status(400).send(error));
    },

    retrieve(req, res) {
        return repository.retrieve(req.params.id)
        .then(entry => {
            if(!entry) {
                return res.status(404).send({ message: 'Entry Not Found' })
            }
            res.status(200).send(entry);
        })
        .catch(error => res.status(400).send(error));
    },

    latest(req, res) {
        return repository.latest()
        .then(entries => {
            res.status(200).send(entries);
        })
        .catch(error => res.status(400).send(error))
    },

    random(req, res) {
        repository.totalRows().then(val => {
            var obj = val[0];
            var total_rows = '';
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const element = obj[key];
                    total_rows = element['total_rows'];
                    break;
                }
            };
            
            var random = util.getRandomInteger(total_rows);
            return repository.retrieve(random);
        })
        .then(entry => {
            return res.status(200).send(entry);
        })
        .catch(error => res.status(400).send(error))
    },

    create(req, res){
        var new_entry = {
            title: req.body.title,
            date: req.body.date,
            body: req.body.body
        };

        return repository
            .create(new_entry)
            .then(entry => res.status(201).send({ message: 'Entry created!', data: entry }))
            .catch(error => res.status(400).send({ message: 'Create failed. Code: 44', data: error }));
    },

    update(req, res){
        var update_entry = {
            title: req.body.title,
            body: req.body.body,
            date: req.body.date
        };

        repository.retrieve(req.params.id)
        .then(entry => {
            if(!entry) {
                return res.status(404).send({ message: 'Entry Not Found' })
            }
            return repository.update(entry, update_entry)
            .then(() => res.status(200).send({ message: 'Update success!' }))
            .catch((error) => res.status(400).send({ message: 'Update failed', data: error }));
        })
        .catch(error => res.status(400).send({ message: 'Update failed. Code: 43', data: error }));
    },

    destroy(req, res){
        repository.retrieve(req.params.id)
        .then(entry => {
            if(!entry) {
                return res.status(404).send({ message: 'Entry Not Found' })
            }
            return repository.destroy(entry)
            .then(() => res.status(200).send({ message: 'Delete success!' }))
            .catch(error => res.status(400).send({ message: 'Delete failed', data: error }));
        })
        .catch(error => res.status(400).send({ message: 'Delete failed. Code: 42', data: error }));
    },

    async groupByYear(req, res) {

        const promiseYear = await getYear();
        Promise.all(promiseYear)
        .then(async result => {

            let years = computeYear(result);

            const promises = years.map(async year => {
                const mapYearMonth = await getMonthByYear(year);
                // FIXME why can't i just construct array here with year as key
                return [year, mapYearMonth];
            });
            
            const promiseResult = await Promise.all(promises);

            return promiseResult;
        })
        .then(results => {
            // why do i have to do it here
            let combined = computeMonthByYear(results);

            // the code's getting smellier
            return res.status(200).send(combined)
        })
        .catch(error => res.status(400).send({ message : error }));
    }
};

// Raw query promises
const getYear = _ => {
    let queryYear = "SELECT YEAR(date) YEAR, COUNT(*) COUNT FROM `entries` GROUP BY year(date) ORDER BY YEAR DESC";
    return repository.customQuery(queryYear)
}

const computeYear = result => {
    let years = [];
    result.forEach(stuff => {
        for (key in stuff) {
            if (stuff.hasOwnProperty(key)) {
                const val = stuff[key];
                if (key === "YEAR") years.push(val);
            }
        }
    });
    return years;
}

const getMonthByYear = year => {
    let queryYearMonth = `SELECT MONTH(date) month, COUNT(*) count FROM \`entries\` WHERE YEAR(date) = '${year}' GROUP BY MONTH(date) ORDER BY month DESC`;
    return repository.customQuery(queryYearMonth);
}

const computeMonthByYear = results => {
    let json = {};
    let yearMonthsData = [];
    results.forEach(result => {
        let yearMonths = {};
        let year = result[0];
        let monthsData = result[1];
        yearMonths["year"] = year;
        yearMonths["data"] = monthsData;
        yearMonthsData.push(yearMonths);
    });
    json["data"] = yearMonthsData;
    return json;
}