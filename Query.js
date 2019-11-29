const requests = require('request');
const csvWriter = require('csv-writer').createArrayCsvWriter;
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const ENDPOINT = 'https://gis-api.aiesec.org/graphql';
const QueryCtrl = {};

QueryCtrl.formReqBody = (page, per_page) => {
    return `,
    page: ${page}, per_page: ${per_page}
    ){
    paging{
      total_items,
      total_pages,
      current_page
    },
    data{
      status,
      created_at,
      date_matched,
      date_approved,
      date_realized,
      experience_start_date,
      experience_end_date,
      person{
        id,
        full_name,
        contact_detail{
          phone,
          email
        },
        meta{
          allow_email_communication,
          allow_phone_communication
        },
        home_lc{
          name,
          parent{
            name
          }
        }
      },
      opportunity{
        id,
        sub_product{
          name
        },
        programme{
          short_name_display
        },
        title,
        home_lc{
          name,
          parent{
            name
          }
        }
      }
    }
    }}`;
}

QueryCtrl.formAppReq = (req, page, per_page ) =>{
    let QBody = QueryCtrl.formReqBody(page, per_page);

    return {
        headers:{
            'Authorization' : req.body.token,
            'Content-Type' : 'application/json'

        },
        body: JSON.stringify({'query':`{allOpportunityApplication(
            filters:{
              person_home_lc: [${req.body.lc}],
              created_at: {from: "${req.body.dateFrom}", to:"${req.body.dateTo}"},
              programmes: ${req.body.product}
            }${QBody}`})
    };
}

QueryCtrl.getAPPs = async (req, res) =>{
    res.json(
        await QueryCtrl.processData('APPS', req)
    );
}

QueryCtrl.makeReq = async (DATA) =>{
    let count = 0;
    do {
        count++;
        let r = await QueryCtrl.sendRequest(DATA);
        if( r.statusCode == 200){
            return JSON.parse(r.body).data.allOpportunityApplication;
        } 
    } while (count <= 10);
}

QueryCtrl.sendRequest = (DATA) => {
    return new Promise(function(resolve, reject) {
        requests.post(ENDPOINT, DATA,  (error, result) => {
            if(error){
                reject(error);
            }
            else{
                resolve(result);
            }
        })
    });
}

QueryCtrl.processData = async (type, req) =>{
    try{
        let apps;
        if(String(type).includes('APP')){
            apps = await  QueryCtrl.makeReq(QueryCtrl.formAppReq(req, 1, 100));
        }
        if(apps !== undefined && apps.paging.total_pages <= 100){
            let totalP = apps.paging.total_pages;
            let matrix = [];
            matrix.push([
                "PRODUCT",
                "EP ID",
                "STATUS",
                "EP NAME",
                "PHONE",
                "EMAIL",
                "ALLOWS PHONE CONTACT",
                "ALLOWS EMAIL CONTACT",
                "APPLIED AT",
                "MATCHED OR REJECTED AT",
                "APPROVED AT",
                "REALIZE DATE",
                "XP START DATE",
                "XP END DATE",
                "HOME LC",
                "HOME MC",
                "OPP ID",
                "OPP NAME",
                "SUBPRODUCT",
                "HOST LC",
                "HOST MC"
            ]);
            let page = 1;
            do {
                apps.data.forEach(app => {
                    matrix.push([
                        app.opportunity.programme.short_name_display,
                        app.person.id,
                        app.status,
                        app.person.full_name,
                        app.person.contact_detail.phone,
                        app.person.contact_detail.email,
                        app.person.meta.allow_phone_communication,
                        app.person.meta.allow_email_communication,
                        String(app.created_at).split('T')[0],
                        app.date_matched ? String(app.date_matched).split('T')[0] : '',
                        app.date_approved ? String(app.date_approved).split('T')[0]: '',
                        app.date_realized ? String(app.date_realized).split('T')[0]: '',
                        app.experience_start_date ? String(app.experience_start_date).split('T')[0]: '',
                        app.experience_end_date ? String(app.experience_end_date).split('T')[0]: '',
                        app.person.home_lc.name,
                        app.person.home_lc.parent.name,
                        app.opportunity.id,
                        app.opportunity.title,
                        app.opportunity.sub_product ? app.opportunity.sub_product.name : '-',
                        app.opportunity.home_lc.name,
                        app.opportunity.home_lc.parent.name
                    ]);
                });
                page++;
                if( page<totalP){
                    if(String(type).includes('APP')){
                        apps = await  QueryCtrl.makeReq(QueryCtrl.formAppReq(req, page, 100));
                    }
                }
                
            } while (page<=totalP);

            QueryCtrl.deleteOldFiles();
            
            let pathT  = '/Documents/'+new Date().toISOString().replace(/:/g,"-")+'APPs.csv';
            cWriter = csvWriter({
                path: '.'+pathT
            });

            await cWriter.writeRecords(matrix).then(() => {
                console.log(pathT);
            });

            return {'result': 'Succesful', 'link': pathT}

        }else{
            //CAMBIAR LUEGO POR RETURN
            return { 
                'result': 'error',
                'error': 'Error in request or Requesting more than 10000 rows.'
            };
        }
    }catch(err){
        console.log(err);
        return { 
            'result': 'error',
            'error': 'Error in request, try again.'
        };
    }
}

QueryCtrl.deleteOldFiles = () =>{
    let uploadsDir = __dirname + '/Documents';
    try{
        fs.readdir(uploadsDir, function(err, files) {
        files.forEach(function(file, index) {
            fs.stat(path.join(uploadsDir, file), function(err, stat) {
            let endTime, now;
            if (err) {
                return console.error(err);
            }
            now = new Date().getTime();
            endTime = new Date(stat.ctime).getTime() + 3600000;
            if (now > endTime) {
                return rimraf(path.join(uploadsDir, file), function(err) {
                if (err) {
                    return console.error(err);
                }
                console.log('successfully deleted all old files');
                });
            }
            });
        });
        });
    }catch(er){
        console.log('Error while deleting: '+ er)
    }
}

module.exports = QueryCtrl;