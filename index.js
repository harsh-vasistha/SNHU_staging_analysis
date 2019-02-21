const excel = require('xlsx');
const fs = require('fs');

var workbook = excel.readFile('staging.xlsx');
var sheet_data = excel.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
var recprds = {};
var object_report = { Total: { Name: 'Grand Total', New: 0, Success: 0, Error: 0, Deleted: 0, Total: 0 } };
for (var i in sheet_data) {
    recprds[sheet_data[i].ID] = sheet_data[i];
    if (!object_report.hasOwnProperty(sheet_data[i].OBJECT_NAME__C)) {
        object_report[sheet_data[i].OBJECT_NAME__C] = { Name: sheet_data[i].OBJECT_NAME__C, New: 0, Success: 0, Error: 0, Deleted: 0, Total: 0 }
    }
    switch (sheet_data[i].STATUS__C) {
        case 'Success':
            object_report[sheet_data[i].OBJECT_NAME__C].Total++;
            object_report[sheet_data[i].OBJECT_NAME__C].Success++;
            object_report.Total.Total++;
            object_report.Total.Success++;
            break;
        case 'Error':
            object_report[sheet_data[i].OBJECT_NAME__C].Total++;
            object_report[sheet_data[i].OBJECT_NAME__C].Error++;
            object_report.Total.Total++;
            object_report.Total.Error++;
            break;
        case 'New':
            object_report[sheet_data[i].OBJECT_NAME__C].Total++;
            object_report[sheet_data[i].OBJECT_NAME__C].New++;
            object_report.Total.Total++;
            object_report.Total.New++;
            break;
        case 'Deleted':
            object_report[sheet_data[i].OBJECT_NAME__C].Total++;
            object_report[sheet_data[i].OBJECT_NAME__C].Deleted++;
            object_report.Total.Total++;
            object_report.Total.Deleted++;
            break;
    }
}
var data = [];
for (var key in object_report) {
    data.push(object_report[key]);
}

var work_sheet = excel.utils.json_to_sheet(data);
var csv_value = excel.utils.sheet_to_csv(work_sheet);
fs.writeFileSync('staging_record_analysis.csv', csv_value);

var dlog_workbook = excel.readFile('dlog.xlsx');
var dlog_data = excel.utils.sheet_to_json(dlog_workbook.Sheets[dlog_workbook.SheetNames[0]]);
var dlog_records = {};
for (var i in dlog_data) {
    dlog_records[dlog_data[i].MESSAGE__C.substring(0,18)] = dlog_data[i];
}
var analysis = {};
for(var i in recprds){
    if(recprds[i].STATUS__C == 'Error'
    && dlog_records.hasOwnProperty(recprds[i].ID)){
        analysis[recprds[i].ID] = {
            Staging_Record_Id : recprds[i].ID,
            API_Name : recprds[i].OBJECT_NAME__C,
            DLog_Id : dlog_records[recprds[i].ID].ID,
            DLog_Msg : dlog_records[recprds[i].ID].MESSAGE__C
        };
    }
}

data = [];
for (var key in analysis) {
    data.push(analysis[key]);
}
var work_sheet = excel.utils.json_to_sheet(data);
var csv_value = excel.utils.sheet_to_csv(work_sheet);
fs.writeFileSync('staging_dlog_mapping.csv', csv_value);