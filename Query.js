const requests = require('request');
const csvWriter = require('csv-writer').createArrayCsvWriter;
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const nmailer = require('nodemailer');

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
        email,
        contact_detail{
          phone
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

QueryCtrl.formOppsReqBody = (page, per_page) => {
    return `,
    page: ${page}, per_page: ${per_page}
    ){
    paging{
      total_items,
      total_pages,
      current_page
    },
    data{
        id,
        status,
        title,
        organisation{
            name
        },
        earliest_start_date,
        duration,
        applications_close_date,
        available_openings,
        home_lc{
            name,
            parent{
                name
            }
        },
        sub_product{
            name,
        },
        backgrounds{
            constant_name
        },
        nationalities{
            constant_name,
        }
    }
    }}`;
}

QueryCtrl.formStandardsReqBody = (page, per_page) => {
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
        experience_end_date,
        nps_response{
          questions{
            nps_answer
          }
        },
        standards{
          standard_option{
            option
          }
        },
        person{
          id,
          full_name,
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
                person_committee: ${req.body.lc},
                created_at: {from: "${req.body.dateFrom}", to:"${req.body.dateTo}"},
                programmes: ${req.body.product}
            }${QBody}`})
    };
}

QueryCtrl.formAccReq = (req, page, per_page ) =>{
    let QBody = QueryCtrl.formReqBody(page, per_page);

    return {
        headers:{
            'Authorization' : req.body.token,
            'Content-Type' : 'application/json'

        },
        body: JSON.stringify({'query':`{allOpportunityApplication(
            filters:{
                person_committee: ${req.body.lc},
                date_matched: {from: "${req.body.dateFrom}", to:"${req.body.dateTo}"},
                programmes: ${req.body.product}
            }${QBody}`})
    };
}

QueryCtrl.formApdReq = (req, page, per_page ) =>{
    let QBody = QueryCtrl.formReqBody(page, per_page);

    return {
        headers:{
            'Authorization' : req.body.token,
            'Content-Type' : 'application/json'

        },
        body: JSON.stringify({'query':`{allOpportunityApplication(
            filters:{
                person_committee: ${req.body.lc},
                date_approved: {from: "${req.body.dateFrom}", to:"${req.body.dateTo}"},
                programmes: ${req.body.product}
            }${QBody}`})
    };
}

QueryCtrl.formReReq = (req, page, per_page ) =>{
    let QBody = QueryCtrl.formReqBody(page, per_page);

    return {
        headers:{
            'Authorization' : req.body.token,
            'Content-Type' : 'application/json'

        },
        body: JSON.stringify({'query':`{allOpportunityApplication(
            filters:{
                person_committee: ${req.body.lc},
                date_realized: {from: "${req.body.dateFrom}", to:"${req.body.dateTo}"},
                programmes: ${req.body.product}
            }${QBody}`})
    };
}

QueryCtrl.formFiReq = (req, page, per_page ) =>{
    let QBody = QueryCtrl.formReqBody(page, per_page);

    return {
        headers:{
            'Authorization' : req.body.token,
            'Content-Type' : 'application/json'

        },
        body: JSON.stringify({'query':`{allOpportunityApplication(
            filters:{
                person_committee: ${req.body.lc},
                experience_end_date: {from: "${req.body.dateFrom}", to:"${req.body.dateTo}"},
                programmes: ${req.body.product}
            }${QBody}`})
    };
}

QueryCtrl.formStandardsReq = (req, page, per_page ) =>{
    let QBody = QueryCtrl.formStandardsReqBody(page, per_page);

    return {
        headers:{
            'Authorization' : req.body.token,
            'Content-Type' : 'application/json'

        },
        body: JSON.stringify({'query':`{allOpportunityApplication(
            filters:{
                person_committee: ${req.body.lc},
                experience_end_date: {from: "${req.body.dateFrom}", to:"${req.body.dateTo}"},
                programmes: ${req.body.product}
            }${QBody}`})
    };
}

QueryCtrl.formCoReq = (req, page, per_page ) =>{
    let QBody = QueryCtrl.formReqBody(page, per_page);

    return {
        headers:{
            'Authorization' : req.body.token,
            'Content-Type' : 'application/json'

        },
        body: JSON.stringify({'query':`{allOpportunityApplication(
            filters:{
                person_committee: ${req.body.lc},
                experience_end_date: {from: "${req.body.dateFrom}", to:"${req.body.dateTo}"},
                status: "completed",
                programmes: ${req.body.product}
            }${QBody}`})
    };
}

QueryCtrl.formOppReq = (req, page, per_page ) =>{
    let QBody = QueryCtrl.formOppsReqBody(page, per_page);

    return {
        headers:{
            'Authorization' : req.body.token,
            'Content-Type' : 'application/json'

        },
        body: JSON.stringify({'query':`{allOpportunity(
            filters:{
                programmes: ${req.body.product}
            }${QBody}`})
    };
}

QueryCtrl.getAPPs = async (req, res) =>{
    await QueryCtrl.processData(req.body.type ,req, res);
}

QueryCtrl.getOPPs = async (req, res) =>{
    await QueryCtrl.processOPPsData(req, res);
}

QueryCtrl.getSnS = async (req,res) => {
    await QueryCtrl.processSnSData(req, res);
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

QueryCtrl.makeOppReq = async (DATA) =>{
    let count = 0;
    do {
        count++;
        let r = await QueryCtrl.sendRequest(DATA);
        if( r.statusCode == 200){
            return JSON.parse(r.body).data.allOpportunity;
        } else{
            console.log(r.statusCode + '----'+r.body)
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

QueryCtrl.selectType = async (type,req,page) => {
    let apps;
        switch (String(type)) {
            case 'APPs':
                apps = await  QueryCtrl.makeReq(QueryCtrl.formAppReq(req, page, 100));
                break;
            case 'ACCs':
                apps = await  QueryCtrl.makeReq(QueryCtrl.formAccReq(req, page, 100));
                break;
            case 'APDs':
                apps = await  QueryCtrl.makeReq(QueryCtrl.formApdReq(req, page, 100));
                break;
            case 'REs':
                apps = await  QueryCtrl.makeReq(QueryCtrl.formReReq(req, page, 100));
                break;
            case 'FIs':
                apps = await  QueryCtrl.makeReq(QueryCtrl.formFiReq(req, page, 100));
                break;
            case 'COs':
                apps = await  QueryCtrl.makeReq(QueryCtrl.formCoReq(req, page, 100));
                break;
        }
    return apps;
}

QueryCtrl.processData = async (type, req, res) =>{
    try{
        let apps = await QueryCtrl.selectType(type,req,1);
        if(apps !== undefined && apps.paging.total_pages <= 100){

            res.json({
                'result': 'Succesful',
            });

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
                    try{
                        matrix.push([
                            app.opportunity.programme.short_name_display ? app.opportunity.programme.short_name_display : '',
                            app.person.id?app.person.id:'',
                            app.status?app.status:'',
                            app.person.full_name?app.person.full_name:'',
                            app.person.contact_detail?app.person.contact_detail.phone:'',
                            app.person.email?app.person.email:'',
                            app.person.meta.allow_phone_communication?app.person.meta.allow_phone_communication:'',
                            app.person.meta.allow_email_communication?app.person.meta.allow_email_communication:'',
                            String(app.created_at).split('T')[0],
                            app.date_matched ? String(app.date_matched).split('T')[0] : '',
                            app.date_approved ? String(app.date_approved).split('T')[0]: '',
                            app.date_realized ? String(app.date_realized).split('T')[0]: '',
                            app.experience_start_date ? String(app.experience_start_date).split('T')[0]: '',
                            app.experience_end_date ? String(app.experience_end_date).split('T')[0]: '',
                            app.person.home_lc.name?app.person.home_lc.name:'',
                            app.person.home_lc.parent.name?app.person.home_lc.parent.name:'',
                            app.opportunity.id?app.opportunity.id:'',
                            app.opportunity.title?app.opportunity.title:'',
                            app.opportunity.sub_product ? app.opportunity.sub_product.name : '-',
                            app.opportunity.home_lc.name?app.opportunity.home_lc.name:'',
                            app.opportunity.home_lc.parent.name?app.opportunity.home_lc.parent.name:''
                        ]);
                    }catch(err){
                        console.log('Error al guardar una app: ' + err)
                    }
                });
                page++;
                if( page<=totalP){
                    apps = await QueryCtrl.selectType(type,req,page);
                }
                
            } while (page<=totalP);

            QueryCtrl.deleteOldFiles();
            let date = new Date();
            
            let pathT  = '/Documents/'+date.toISOString().replace(/:/g,"-")+'APPs.csv';
            cWriter = csvWriter({
                path: '.'+pathT
            });

            await cWriter.writeRecords(matrix).then(() => {
                console.log(pathT);
            });

            //Enviar correo
            await QueryCtrl.sendEmail(req, pathT, date);

        }else{
            res.json({ 
                'result': 'error',
                'error': 'Error in request or Requesting more than 10000 rows.'
            });
        }
    }catch(err){
        console.log(err);
        res.json({ 
            'result': 'error',
            'error': 'Error in request, try again.'
        });
    }
}

QueryCtrl.processOPPsData = async (req, res) =>{
    try{
        let opps = await QueryCtrl.makeOppReq(QueryCtrl.formOppReq(req, 1, 100));
        if(opps !== undefined && opps.paging.total_pages <= 100){

            res.json({
                'result': 'Succesful',
            });

            let totalP = opps.paging.total_pages;
            let matrix = [];
            matrix.push([
                "OPP ID",
                "STATUS",
                "TITLE",
                "ORGANIZATION",
                "START DATE",
                "DURATION (WEEKS)",
                "APPS CLOSING DATE",
                "SPOTS",
                "HOST LC",
                "HOST MC",
                "SUBPRODUCT",
                "BACKGROUNDS",
                "NATIONALITIES"
            ]);
            let page = 1;
            do {
                opps.data.forEach(app => {
                    try{
                        matrix.push([
                            app.id ? app.id : '',
                            app.status?app.status:'',
                            app.title?app.title:'',
                            app.organisation.name?app.organisation.name:'',
                            app.earliest_start_date ? String(app.earliest_start_date).split('T')[0] : '',
                            app.duration ? app.duration : '',
                            app.applications_close_date ? String(app.applications_close_date).split('T')[0]: '',
                            app.available_openings? app.available_openings : '',
                            app.home_lc?app.home_lc.name:'',
                            app.home_lc?app.home_lc.parent?app.home_lc.parent.name : '':'',
                            app.sub_product ? app.sub_product.name : '-',
                            app.backgrounds?QueryCtrl.concatAsString(app.backgrounds):'',
                            app.nationalities?QueryCtrl.concatAsString(app.nationalities):''
                        ]);
                    }catch(err){
                        console.log('Error al guardar una opp: ' + err)
                    }
                });
                page++;
                if( page<=totalP){
                    opps = await QueryCtrl.makeOppReq(QueryCtrl.formOppReq(req, page, 100));
                }
                
            } while (page<=totalP);

            QueryCtrl.deleteOldFiles();
            let date = new Date();
            
            let pathT  = '/Documents/'+date.toISOString().replace(/:/g,"-")+'OPPs.csv';
            cWriter = csvWriter({
                path: '.'+pathT
            });

            await cWriter.writeRecords(matrix).then(() => {
                console.log(pathT);
            });

            // Aquí enviar correo
            await QueryCtrl.sendEmail(req, pathT, date);

        }else{
            //CAMBIAR LUEGO POR RETURN
            res.json({ 
                'result': 'error',
                'error': 'Error in request or Requesting more than 10000 rows.'
            });
        }
    }catch(err){
        console.log(err);
        res.json( { 
            'result': 'error',
            'error': 'Error in request, try again.'
        });
    }
}

QueryCtrl.processSnSData = async (req, res) =>{
    try{
        let SnS = await  QueryCtrl.makeReq(QueryCtrl.formStandardsReq(req, 1, 100));
        if(SnS !== undefined && SnS.paging.total_pages <= 100){

            res.json({
                'result': 'Succesful',
            });

            let totalP = SnS.paging.total_pages;
            let matrix = [];
            matrix.push([
                "PRODUCT",
                "EP ID",
                "STATUS",
                "EP NAME",
                "XP END DATE",
                "HOME LC",
                "HOME MC",
                "OPP ID",
                "SUBPRODUCT",
                "HOST LC",
                "HOST MC",
                "Personal goal setting",
                "Outgoing Preparation",
                "Expectation setting",
                "Insurance",
                "Visa and work permit",
                "Arrival pickup",
                "Accommodation",
                "Incoming Preparation",
                "First day of work",
                "Alignment Spaces with Opportunity Provider",
                "Job description",
                "Working hours",
                "Duration",
                "Opportunity benefits",
                "Departure support",
                "Debrief with AIESEC",
                "How likely would you recommend the experience you lived through AIESEC to a friend or colleague?",
                "Would you be interested in living another exchange experience through AIESEC in the future?",
                "Would you be interested of being a volunteer member of AIESEC in a local office?",
                "Do you have any feedback for us to know we are doing well and what we could improve on?",
                "What are the top 2 issues that you would say that you were the most satisfied with during your exchange experience?",
                "What are the top 2 issues that you would say that you were the least satisfied with?",
                "How likely would you recommend AIESEC as a leadership development organization?"
            ]);
            let page = 1;
            do {
                SnS.data.forEach(app => {
                    try{
                        let row = [
                            app.opportunity.programme.short_name_display ? app.opportunity.programme.short_name_display : '',
                            app.person.id?app.person.id:'',
                            app.status?app.status:'',
                            app.person.full_name?app.person.full_name:'',
                            app.experience_end_date ? String(app.experience_end_date).split('T')[0]: '',
                            app.person.home_lc.name?app.person.home_lc.name:'',
                            app.person.home_lc.parent.name?app.person.home_lc.parent.name:'',
                            app.opportunity.id?app.opportunity.id:'',
                            app.opportunity.sub_product ? app.opportunity.sub_product.name : '-',
                            app.opportunity.home_lc.name?app.opportunity.home_lc.name:'',
                            app.opportunity.home_lc.parent.name?app.opportunity.home_lc.parent.name:'']
                            app.standards.forEach( standard => {
                                row.push(standard.option ? standard.option : 'Not answered')
                            });
                            app.nps_response.questions.forEach(question => {
                                row.push(question.nps_answer ? String(question.nps_answer) : 'Not answered')
                            });
                        matrix.push(row);
                    }catch(err){
                        console.log('Error al guardar una app: ' + err)
                    }
                });
                page++;
                if( page<=totalP){
                    SnS = await  QueryCtrl.makeReq(QueryCtrl.formStandardsReq(req, page, 100));
                }
                
            } while (page<=totalP);

            QueryCtrl.deleteOldFiles();
            let date = new Date();
            
            let pathT  = '/Documents/'+date.toISOString().replace(/:/g,"-")+'SnS.csv';
            cWriter = csvWriter({
                path: '.'+pathT
            });

            await cWriter.writeRecords(matrix).then(() => {
                console.log(pathT);
            });

            // Aquí enviar correo
            await QueryCtrl.sendEmail(req, pathT, date);

        }else{
            //CAMBIAR LUEGO POR RETURN
            res.json({ 
                'result': 'error',
                'error': 'Error in request or Requesting more than 10000 rows.'
            });
        }
    }catch(err){
        console.log(err);
        res.json( { 
            'result': 'error',
            'error': 'Error in request, try again.'
        });
    }
}

QueryCtrl.concatAsString = (array) =>{
    let sFinal = '';
    try{
        array.forEach(el => sFinal = sFinal + el.constant_name + '/');
    }catch(er){
        console.log('Error concatenando: '+er)
    }
    return sFinal;
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

QueryCtrl.sendEmail = async (req, pathT, date) =>{
    let transporter = nmailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'gmail',
        port: 587,
        secure: false,
        auth: {
          user: 'developer.im@aieseccolombia.org', 
          pass: req.body.pass 
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    // send mail with defined transport object
    await transporter.sendMail({
    from: '"OGT-EST-20.1" <donotreply@aieseccolombia.com>', // sender address
    to: req.body.mail, // list of receivers
    subject: `[IMP] ${date.toISOString()} Your request have been processed: Link to the extracted EXPA Info`, // Subject line
    html: `<b>REQUEST SUCCESSFULLY COMPLETED</b>
    <p> In order to download the requested data, please follow this link: </p>
    <a href="http://expa-export-proj-expa-export.apps.us-east-2.starter.openshift-online.com${pathT}" >CLICK HERE</a>
    <p> Please remember that the link will only be avaliable for an hour, after that, the file may be deleted and the link may stop working. </p>
    <p> Hope it is useful for you. </p>` // html body
    }, (err, info)=>{
        if(err){
            console.log(err);
        }
    });
}

module.exports = QueryCtrl;