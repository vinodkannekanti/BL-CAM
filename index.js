var CAM_DATA;
$(document).ready(function () {
	$('.example1').datepicker({
		format: "dd/mm/yy",
		autoclose: true
	});

	var params = new URL(window.location).searchParams;

	var host = params.get('host');
	var appId = params.get('appId');
	var env;
	if(host == 'dev'){
		env = 'https://dev-api.incred.com';
	}
	else if(host == 'uat'){
		env = 'https://uat-api.incred.com';
	}else if(host == 'prod'){
		env = 'https://api.incred.com';
	}else{
		env = 'http://localhost:3004';
	}
	document.getElementById('host').value = env;
	document.getElementById('appid').value = appId;

	$.ajax({
		crossDomain: true,
		type: "GET",
		contentType: "application/json",
		beforeSend: function (request) {
			$('.ajax-loader').css("visibility", "visible");
			$('.ajax-loader').css("height", document.body.scrollHeight);
			request.setRequestHeader("api-key", "f72f0ffdad341711a9f978f5e9db448fc84733fbcb271ff7302a360debb942");
		},
		//url: "http://localhost:3004/v2/cam/get/3285469037151094A",
		url: document.getElementById('host').value+"/v2/cam/get/"+ document.getElementById('appid').value,
		success: function (msg) {
			if (msg && msg.response) {
				CAM_DATA = msg.response.DATA;
				var DATA = msg.response.DATA || {};
				var fa = DATA.FINANCIAL_ANALYSYS || {};
				var pdNote = DATA.PD_NOTE || {};
				var RTR = DATA.RTR || {};
				var overview = DATA.OVERVIEW || {};

				updateFinancialAnalysys(fa);
				fillRTRForm(RTR);
				//overview = {};
				//pdNote = {};
				if (Object.keys(overview).length != 0) {
					fillOverviewData(overview,DATA);
				}
				if (Object.keys(pdNote).length != 0) {
					fillPDNote(pdNote, fa);
				}
				if (Object.keys(overview).length == 0 || Object.keys(pdNote).length == 0) {
					getApplicationData(function (appData) {
						if (Object.keys(overview).length == 0) {
							overview = prepareOverviewData(appData);
							fillOverviewData(overview,DATA);
						}
						if (Object.keys(pdNote).length == 0) {
							pdNote = preparePDNoteData(appData);
							fillPDNote(pdNote, fa);
						}

					});
				}
			}
		},
		complete: function () {
			$('.ajax-loader').css("visibility", "hidden");
		}
	});
	$('#rtr-btn').click(function (e) {
		e.preventDefault();
		var data = getRTRCalculations();
		var updatedData = updateRTRCalculations(data);
		//updatedData =  verifyRTR(updatedData);
		updateRTR(updatedData);
	 });

	 $('#ov-btn').click(function (e) {
		e.preventDefault();
		var data = getOVerviewInfo();
		//data = verifyOverview(data);
		updateOverview(data);
	});

	$('#pl-btn').click(function (e) {
		e.preventDefault();
		var fa = getFA(CAM_DATA);
		//fa = verifyFA(fa);
		updateFA(fa);

	});

	$('#pd-btn').click(function (e) {
		e.preventDefault();
		var pdNote = getPDNote();
		updatePDNote(pdNote);
	});
	
	$('#save-cam-btn').click(function(e){
		e.preventDefault();
		var errorMsg = {};
		var data = {};
		var banking = {};
		var rtr = getRTRCalculations();
		rtr = updateRTRCalculations(rtr);
		// verifyRTR(rtr,function(err,isValid){
		// 	if(isValid){
		// 		data.RTR = rtr;
		// 	}else{
		// 		errorMsg.RTR = err;
		// 	}
		// });
		// var ov = getOVerviewInfo();
		// verifyOverview(ov,function(err,isValid){
		// 	if(isValid){
		// 		data.OVERVIEW = ov;
		// 	}else{
		// 		errorMsg.OVERVIEW = err;
		// 	}
		// });
		// var fa = getFA(CAM_DATA);
		// verifyFA(fa,function(err,isValid){
		// 	if(isValid){
		// 		data.FINANCIAL_ANALYSYS = fa;
		// 	}else{
		// 		errorMsg.FINANCIAL_ANALYSYS = err;
		// 	}
		// });

		data.RTR = rtr;
		data.OVERVIEW = ov;
		data.FINANCIAL_ANALYSYS = fa;
		var pdNote = getPDNote();
		data.PD_NOTE = pdNote;
		
		if(Object.keys(errorMsg).length > 0){
			var message = { message: 'Some calculations are incorrect', data: { DATA: errorMsg }};
			alert(JSON.stringify(message));
		}else{
			// var message ={message: 'All calculations are correct'};
			// alert(JSON.stringify(message));
			var url = "/v2/cam/update";
			var dataObj = {
				"APPLICATION_ID": document.getElementById('appid').value,
				"LOAN_TYPE": "BL",
				"DATA": data
			};
			updateCAMCalculation(dataObj, url);
		}
	});

	$("input[type=number][name!=rtr]").bind('keyup change', function () {
		
		var rtrData = getRTRCalculations();
		rtrData = updateRTRCalculations(rtrData);
		CAM_DATA.RTR = rtrData;
		
		var data = getOVerviewInfo();
		CAM_DATA.OVERVIEW = data;
		
		var fa = calculateFinancialAnalysys(CAM_DATA);
		CAM_DATA.FINANCIAL_ANALYSYS = fa;
		updateFinancialAnalysys(fa);
		updateFAFieldsOfPDNote(fa);

		fillOverviewData(CAM_DATA.OVERVIEW,CAM_DATA);

	});
	$("input[type=number][name=rtr]").bind('keyup change', function () {
		var rtrData = getRTRCalculations();
		rtrData = updateRTRCalculations(rtrData);
		CAM_DATA.RTR = rtrData;
		fillRTRForm(rtrData);

		var fa = calculateFinancialAnalysys(CAM_DATA);
		CAM_DATA.FINANCIAL_ANALYSYS = fa;
		updateFinancialAnalysys(fa);
		updateFAFieldsOfPDNote(fa);

		fillOverviewData(CAM_DATA.OVERVIEW,CAM_DATA);

	});
	$("input[type=text][name=rtr]").bind('keyup change', function () {
		var data = getRTRCalculations();
		var updatedData = updateRTRCalculations(data);
		fillRTRForm(updatedData);

		var fa = calculateFinancialAnalysys(CAM_DATA);
		CAM_DATA.FINANCIAL_ANALYSYS = fa;
		updateFinancialAnalysys(fa);
		updateFAFieldsOfPDNote(fa);

		fillOverviewData(CAM_DATA.OVERVIEW,CAM_DATA);
	});
	function getApplicationData(callBack) {
		$.ajax({
			crossDomain: true,
			type: "GET",
			contentType: "application/json",
			beforeSend: function (request) {
				$('.ajax-loader').css("visibility", "visible");
				$('.ajax-loader').css("height", document.body.scrollHeight);
				request.setRequestHeader("api-key", "f72f0ffdad341711a9f978f5e9db448fc84733fbcb271ff7302a360debb942");
			},
			//url: "http://localhost:3004/v2/cam/get/3285469037151094A",
			url: "https://dev-api.incred.com/application/get/" + document.getElementById('appid').value,
			success: function (msg) {
				callBack(msg);
			},
			complete: function () {
				$('.ajax-loader').css("visibility", "hidden");
			}
		});

	}
	function preparePDNoteData(appData) {
		var details = {};
		if (appData && appData.application && appData.customer) {
			var application = appData.application || {};
			var customers = appData.customer || {};
			var promotor = [];
			customers = Object.values(customers).filter(customer => customer.APPLICANT_TYPE == "Primary");
			if (customers.length > 0) {
				console.log('customer :' + JSON.stringify(customers[0]));
				var applicant = customers[0].CUSTOMER || {};
				details.NAME_OF_THE_ENTITY = applicant.COMPANY_NAME;
				details.CONSTITUTION = applicant.COMPANY_CATEGORY.DESC;
				details.NATURE_OF_BUSINESS = applicant.NATURE_OF_BUSINESS.DESC;
				details.INDUSTRY = applicant.INDUSTRY.DESC;
				details.ADDRESS = applicant.ADDRESS || {};
			}
			details.SALES_MANAGER = application.SALES_MANAGER.firstName + ' ' + application.SALES_MANAGER.lastName;
			details.DST = application.DST; //TODO:check with Ranjit
			details.CITY = application.BRANCH_LOCATION.DESC;
		}
		return details;
	}
	function prepareOverviewData(appData) {
		var details = {};
		if (appData && appData.application && appData.customer) {
			var application = appData.application || {};
			var customer = appData.customer || {};
			var address = [];
			var promotor = [];
			Object.values(customer).forEach(function (applicant) {
				var bdDatails = {};
				var customer = applicant.CUSTOMER || {};
				bdDatails.APPLICANT_TYPE = applicant.APPLICANT_TYPE;
				bdDatails.CUSTOMER_TYPE = customer.CUSTOMER_TYPE;
				if (applicant.APPLICANT_TYPE == "Primary") {
					details.CASE_NAME = customer.COMPANY_NAME;
					details.CONSTITUTION = customer.COMPANY_CATEGORY.DESC;
					details.NATURE_OF_BUSINESS = customer.NATURE_OF_BUSINESS.DESC;
					details.INDUSTRY = customer.INDUSTRY.DESC;
					details.COMPANY_WEBSITE = customer.COMPANY_WEBSITE;

					var addreses = Object.values(customer.ADDRESS);
					addreses.forEach(function (item) {
						var adObj = {};
						if (item.ADDRESS_TYPE == "Office Address") {
							adObj.ADDRESS_TYPE = item.ADDRESS_TYPE;
							adObj.OFFICE_OWNERSHIP = item.ACCOMMODATION_TYPE.DESC;
							adObj.OFFICE_ADDRESS = item.ADDRESS;
							adObj.FI_REQUIRED = false;
						}
						if (item.ADDRESS_TYPE == "Registered Address") {
							adObj.ADDRESS_TYPE = item.ADDRESS_TYPE;
							adObj.RESIDENCE_OWNERSHIP = item.ACCOMMODATION_TYPE.DESC;
							adObj.RESIDENCE_ADDRESS = item.ADDRESS;
							adObj.FI_REQUIRED = false;
						}
						if (item.ADDRESS_TYPE == "Factory Address") {
							adObj.ADDRESS_TYPE = item.ADDRESS_TYPE;
							adObj.FACTORY_OWNERSHIP = item.ACCOMMODATION_TYPE.DESC;
							adObj.FACTORY_ADDRESS = item.ADDRESS;
							adObj.FI_REQUIRED = false;
						}
						address.push(adObj);
					});

					details.ADDRESS = address;
				}
				if (customer.CUSTOMER_TYPE == "COMPANY") {
					bdDatails.NAME = customer.COMPANY_NAME;
				} else {
					bdDatails.NAME = customer.FNAME + ' ' + customer.LNAME;
				}
					bdDatails.PERCENTAGE_STAKE_HOLDING = customer.SHARE_HOLDING;
					bdDatails.RELATION_WITH = customer.RELATION_WITH;
					bdDatails.RELATIONSHIP = customer.RELATIONSHIP;
					bdDatails.DOB = customer.DOB;
					bdDatails.EDUCATIONAL_QUALIFICATIONS = customer.EDUCATIONAL_QUALIFICATIONS;
					bdDatails.WORKING_SINCE = customer.WORKING_SINCE;
					bdDatails.WORK_INDUSTRY_EXPERIENCE = customer.WORK_INDUSTRY_EXPERIENCE;
					bdDatails.CIBIL_SCORE = customer.CIBIL_SCORE; //TODO:check with ranjit and karthikeya
					bdDatails.LINKEDIN = customer.LINKEDIN; //TODO:check with ranjit and karthikeya

				promotor.push(bdDatails);
			});

			details.PROMOTOR_DETAILS = promotor;

			details.APPLICATION_ID = application.APPLICATION_ID;
			details.SALES_MANAGER = application.SALES_MANAGER.firstName + ' ' + application.SALES_MANAGER.lastName;
			details.PARTNER_TYPE = ''; //TODO:check with Ranjit
			details.LOCATION = application.BRANCH_LOCATION.DESC; //TODO:check with Ranjit
			details.DST = ''; //TODO:check with Ranjit
			details.PARTNER_NAME = application.PARTNER.PARTNER_NAME;
			details.LOAN_SCHEME = application.LOAN_SCHEME;

			details.FIRST_TIME_BORROWER_UN_SECURED_LOAN = '';
			details.AVAILING_OD_CC_LIMIT = '';

			details.GOOGLE_SEARCH = '';
			details.WATCHOUT_INVESTOR = '';
			details.BIFR = '';
			details.RBI_DEFAULTER_LIST = '';

			details.PROPOSED_LOAN_AMOUNT = application.LOAN_AMOUNT;
			details.RATE_OF_INTEREST = application.RATE_OF_INTEREST;
			details.TENURE = application.LOAN_TENURE;
			details.MONTHLY_EMI = application.MONTHLY_EMI;

			//DEPENDS ON BANKING AND FA DATA
			details.DSCR = '';
			details.ABB = '';
			details.BANKING_THROUGHPUT = '';
			details.VAT_THROUGHPUT = '';
			details.LEVERAGE = '';
			details.BORROWING_TO_TURNOVER_RATIO = '';
			details.WORKING_CAPITAL_GAP = '';
			details.TOPLINE_TREND = '';
			details.BOTTOMLINE_TREND = '';
			details.OPBDIT_TREND = '';
			details.TNW_TREND = '';
			details.CHEQUE_BOUNCE_RATIO = '';

			details.DEVIATIONS = [];
		}
		return details;
	}
	function fillOverviewData(ovData,appCamData) {
		var ovFields = this.ovFields;
		var obj = {};
		
		var financialData=appCamData.FINANCIAL_ANALYSYS;
		//TODO:pl and bs is pending
		var dscrTotal = financialData.DSCR_CALCULATION.DSCR_TOTAL;
		var ratios = financialData.RATIOS;

		ovData.DSCR_TOTAL = dscrTotal;
		ratios.forEach(function(item){
			if(item.YEAR == financialData.CURRENT_FIN_YEAR){
				ovData.LEVERAGE = item.TOL_OR_TNW;
				ovData.WORKING_CAPITAL_GAP = item.NET_WORKING_CAPITAL;
			}
		});


		ovFields.forEach(function (item, idx) {
			var field = item.key;
			var id = 'ov-' + field;
			var ele = document.getElementById(id);
			if (ele) {
				ele.value = ovData[field] || '';
			}
			if (field == "ADDRESS") {
				var addreses = ovData[field] || [];
				var Re_address = [];
				var Ow_address = [];
				var fa_address = [];
				addreses.forEach(function (addressItem) {
					if (addressItem.ADDRESS_TYPE == 'Office Address') {
						Ow_address.push(addressItem);
					}
					if (addressItem.ADDRESS_TYPE == 'Factory Address') {
						fa_address.push(addressItem);
					}
					if (addressItem.ADDRESS_TYPE == 'Registered Address') {
						Re_address.push(addressItem);
					}
				});
				Ow_address.forEach(function (item, idx) {
					idx = idx + 1;
					Object.keys(item).forEach(function (key) {
						if (key == "FI_REQUIRED") {
							var id = 'ov-OFFICE_OWNERSHIP' + '-' + key + '_' + idx;
							var ele = document.getElementById(id);
							if (ele) {
								ele.checked = item[key];
							}
						}
						else {
							var id = 'ov-' + key + '_' + idx;
							var ele = document.getElementById(id);
							if (ele) {
								ele.value = item[key] || '';
							}

						}
					});
				});
				fa_address.forEach(function (item, idx) {
					idx = idx + 1;
					Object.keys(item).forEach(function (key) {
						if (key == "FI_REQUIRED") {
							var id = 'ov-FACTORY_OWNERSHIP' + '-' + key + '_' + idx;
							var ele = document.getElementById(id);
							if (ele) {
								ele.checked = item[key];
							}
						}
						else {
							var id = 'ov-' + key + '_' + idx;
							var ele = document.getElementById(id);
							if (ele) {
								ele.value = item[key] || '';
							}

						}
					});
				});
				Re_address.forEach(function (item, idx) {
					idx = idx + 1;
					Object.keys(item).forEach(function (key) {
						if (key == "FI_REQUIRED") {
							var id = 'ov-RESIDENCE_OWNERSHIP' + '-' + key + '_' + idx;
							var ele = document.getElementById(id);
							if (ele) {
								ele.checked = item[key];
							}
						}
						else {
							var id = 'ov-' + key + '_' + idx;
							var ele = document.getElementById(id);
							if (ele) {
								ele.value = item[key] || '';
							}

						}
					});
				});
			}
			if (field == "PROMOTOR_DETAILS") {

				var pDetails = ovData[field];
				pDetails.forEach(function (bDetails) {
					if (bDetails.CUSTOMER_TYPE == "COMPANY" && bDetails.APPLICANT_TYPE == "Primary") {
						bDetails.index = 1;
					} else {
						bDetails.index = 2;
					}
				});
				pDetails.sort(function (a, b) {
					return a["index"] - b["index"];
				});
				pDetails.forEach(function (bDetails, idx) {

					idx = idx + 1;
					Object.keys(bDetails).forEach(function (bdkey) {
						var id = 'ov-' + 'bd-' + bdkey + '-' + idx;
						var ele = document.getElementById(id);
						if (ele) {
							ele.value = bDetails[bdkey] || '';
						}
					});
				});
			}
			if (field == "DEVIATIONS") {
				var deviations = ovData[field];
				deviations.forEach(function (deviation, idx) {

					idx = idx + 1;
					Object.keys(deviation).forEach(function (dkey) {
						var id = 'ov-DEVIATIONS_' + dkey + '-' + idx;
						var ele = document.getElementById(id);
						if (ele) {
							ele.value = deviation[dkey] || '';
						}
					});
				});

			}
		});

	}
	function compareFields(outputItem, inputItem) {
		var obj = {};
		for (var key in outputItem) {
			if (outputItem.hasOwnProperty(key)) {
				if (outputItem[key] != inputItem[key]) {
					if (outputItem.YEAR) {
						obj.YEAR = outputItem.YEAR;
					} else if (outputItem.FROM_YEAR && outputItem.TO_YEAR) {
						obj.FROM_YEAR = outputItem.FROM_YEAR;
						obj.TO_YEAR = outputItem.TO_YEAR;
					}
					obj[key] = { INPUT: inputItem[key], OUTPUT: outputItem[key] };
				}
			}
		}
		return obj;
	}
	function getUnmatchedCalculations(input, output) {
		var dataArr = [];
		output.forEach(function (outputItem) {
			input.forEach(function (inputItem) {
				var fields = {};
				if (outputItem.YEAR && inputItem.YEAR && outputItem.YEAR == inputItem.YEAR) {
					fields = compareFields(outputItem, inputItem);
				}
				else if (outputItem.FROM_YEAR && inputItem.FROM_YEAR && outputItem.TO_YEAR && inputItem.TO_YEAR &&
					outputItem.FROM_YEAR == inputItem.FROM_YEAR && outputItem.TO_YEAR == inputItem.TO_YEAR) {
					fields = compareFields(outputItem, inputItem);
				}
				if (Object.keys(fields).length > 0) {
					dataArr.push(fields);
				}
			});
		});
		return dataArr;
	}
	function verifyFA(fa,callBack){
		var errObj = {};
		var camData = CAM_DATA || {};
		var faReqData = camData.FINANCIAL_ANALYSYS;
		// //PROFIT & LOS 
		var plInput = faReqData.PROFIT_LOSS_ACCOUNT;
		var plOutput = fa.PROFIT_LOSS_ACCOUNT;
		var plInputYear = plInput.FINANCIAL_YEAR_ANALYSIS;
		var plOutputYear = plOutput.FINANCIAL_YEAR_ANALYSIS;
		var plInputYoy = plInput.FINANCIAL_YEAR_ANALYSIS_YOY;
		var plOutputYoy = plOutput.FINANCIAL_YEAR_ANALYSIS_YOY;
		var faObj = {};
		var errors;
		errors = getUnmatchedCalculations(plInputYear, plOutputYear);
		if (errors.length > 0) {
			faObj.FINANCIAL_YEAR_ANALYSIS = errors;
		}
		errors = getUnmatchedCalculations(plInputYoy, plOutputYoy);
		if (errors.length > 0) {
			faObj.FINANCIAL_YEAR_ANALYSIS_YOY = errors;
		}
		if (Object.keys(faObj).length > 0) {
			errObj.FINANCIAL_ANALYSYS = faObj;
		}
		// //BALANCE SHEET
		var bsInput = faReqData.BALANCE_SHEET;
		var bsOutput = fa.BALANCE_SHEET;
		var bsInputYear = bsInput.FINANCIAL_YEAR_ANALYSIS;
		var bsOutputYear = bsOutput.FINANCIAL_YEAR_ANALYSIS;
		var bsInputYoy = bsInput.FINANCIAL_YEAR_ANALYSIS_YOY;
		var bsOutputYoy = bsOutput.FINANCIAL_YEAR_ANALYSIS_YOY;
		var bsObj = {};
		errors = getUnmatchedCalculations(bsInputYear, bsOutputYear);
		if (errors.length > 0) {
			bsObj.FINANCIAL_YEAR_ANALYSIS = errors;
		}
		errors = getUnmatchedCalculations(bsInputYoy, bsOutputYoy);
		if (errors.length > 0) {
			bsObj.FINANCIAL_YEAR_ANALYSIS_YOY = errors;
		}
		if (Object.keys(bsObj).length > 0) {
			errObj.BALANCE_SHEET = bsObj;
		}
		// //RATIOS
		var ratiosInput = faReqData.RATIOS;
		var ratiosOutput = fa.RATIOS;
		errors = getUnmatchedCalculations(ratiosInput, ratiosOutput);
		if (errors.length > 0) {
			errObj.RATIOS = errors;
		}
		// //CASH POSITION
		var cpInput = faReqData.CASH_POSITION;
		var cpOutput = fa.CASH_POSITION;

		errors = getUnmatchedCalculations(cpInput, cpOutput);
		if (errors.length > 0) {
			errObj.CASH_POSITION = errors;
		}
		// //DSCR CALCULATION
		var dscrInput = faReqData.DSCR_CALCULATION || {};
		var dscrOutput = fa.DSCR_CALCULATION || {};
		var caInput = dscrInput.CASH_ACCRUALS || {};
		var caOutput = dscrOutput.CASH_ACCRUALS || {};
		var caComputationInput = caInput.COMPUTATION || {};
		var caComputationOutput = caOutput.COMPUTATION || {};
		var caYearlyInput = caInput.YEARLY || {};
		var caYearlyOutput = caOutput.YEARLY || {};
		var dscr = {};
		dscr.CASH_ACCRUALS = {};
		dscr.OBLIGATIONS = {};
		var obj = {};
		obj = compareFields(caComputationOutput, caComputationInput);
		if (Object.keys(obj).length > 0) {
			dscr.CASH_ACCRUALS.COMPUTATION = obj;
		}
		obj = compareFields(caYearlyOutput, caYearlyInput);
		if (Object.keys(obj).length > 0) {
			dscr.CASH_ACCRUALS.YEARLY = obj;
		}
		var obInput = dscrInput.OBLIGATIONS || {};
		var obOutput = dscrOutput.OBLIGATIONS || {};
		var obComputationInput = obInput.COMPUTATION || {};
		var obComputationOutput = obOutput.COMPUTATION || {};
		var obYearlyInput = obInput.YEARLY || {};
		var obYearlyOutput = obOutput.YEARLY || {};
		obj = compareFields(obComputationOutput, obComputationInput);
		if (Object.keys(obj).length > 0) {
			dscr.OBLIGATIONS.COMPUTATION = obj;
		}
		obj = compareFields(obYearlyOutput, obYearlyInput);
		if (Object.keys(obj).length > 0) {
			dscr.OBLIGATIONS.YEARLY = obj;
		}
		if(dscrInput.DSCR_TOTAL != dscrOutput.DSCR_TOTAL){
			dscr.DSCR_TOTAL = { INPUT: dscrInput.DSCR_TOTAL, OUTPUT: dscrOutput.DSCR_TOTAL };
		}
		if (dscr.DSCR_TOTAL || Object.keys(dscr.CASH_ACCRUALS).length > 0 || Object.keys(dscr.OBLIGATIONS).length > 0) {
			errObj.DSCR_CALCULATION = dscr;
		}
		if(Object.keys(errObj).length > 0){
			if(callBack){
				callBack(errObj,false);
			}else{
				var message = { "message": "some calculations are incorrect", "data": errObj };
				console.log(JSON.stringify(message));
				alert(JSON.stringify(message));
			}
		}else{
			if(callBack){
				callBack(null,true);
			}else{
				return fa;
			}
		}


	}
	function getFA(appCamData){

		var errObj = {};
		var fa = calculateFinancialAnalysys(appCamData);
		return fa;
	}
	function getPDNote(){
		var pdNote = {};
		var pdFields = this.pdFields;
		for (var i = 0; i < pdFields.length; i++) {
			var id = 'pd' + '-' + pdFields[i];  //pl-2014-1
			var ele = document.getElementById(id);
			if (ele && ele.value) {
				pdNote[pdFields[i]] = ele.value;
			}
		}
		return pdNote;
	}
	function verifyRTR(data,callBack){

		var camData = CAM_DATA || {};
		var rtrReqData = camData.RTR;
		var rtrInput = rtrReqData;
		var rtrOutput = data;
		var inputLoanData = rtrInput.LOAN_DATA;
		var outputLoanData = rtrOutput.LOAN_DATA;
		var loans = [];
		var rtrObj = {};
		inputLoanData.forEach(function(inputItem){
			outputLoanData.forEach(function(outputItem){
				if(inputItem.ACCOUNT_NUMBER == outputItem.ACCOUNT_NUMBER){
						var obj = {};
						if(inputItem.VINTAGE != outputItem.VINTAGE){
							obj.VINTAGE = { INPUT: inputItem.VINTAGE, OUTPUT: outputItem.VINTAGE };
						}
						if(inputItem.BALANCE_TENURE != outputItem.BALANCE_TENURE){
							obj.BALANCE_TENURE = { INPUT: inputItem.BALANCE_TENURE, OUTPUT: outputItem.BALANCE_TENURE };
						}
						if(inputItem.IS_EMI_OBLIGATED != outputItem.IS_EMI_OBLIGATED){
							obj.IS_EMI_OBLIGATED = { INPUT: inputItem.IS_EMI_OBLIGATED, OUTPUT: outputItem.IS_EMI_OBLIGATED };
						}
						if(Object.keys(obj).length > 0){
							obj.ACCOUNT_NUMBER = inputItem.ACCOUNT_NUMBER;
							loans.push(obj);
						}
				}
			});
		});
		if(loans.length > 0){
			rtrObj.LOAN_DATA = loans;
		}
		if(rtrInput.TOTAL_INITIAL_LOAN_AMOUNT != rtrOutput.TOTAL_INITIAL_LOAN_AMOUNT){
			rtrObj.TOTAL_INITIAL_LOAN_AMOUNT = { INPUT: rtrInput.TOTAL_INITIAL_LOAN_AMOUNT, OUTPUT: rtrOutput.TOTAL_INITIAL_LOAN_AMOUNT }; 
		}
		if(rtrInput.TOTAL_CURRENT_OUTSTANDING != rtrOutput.TOTAL_CURRENT_OUTSTANDING){
			rtrObj.TOTAL_CURRENT_OUTSTANDING = { INPUT: rtrInput.TOTAL_CURRENT_OUTSTANDING, OUTPUT: rtrOutput.TOTAL_CURRENT_OUTSTANDING }; 
		}
		if(rtrInput.TOTAL_EMI != rtrOutput.TOTAL_EMI){
			rtrObj.TOTAL_EMI = { INPUT: rtrInput.TOTAL_EMI, OUTPUT: rtrOutput.TOTAL_EMI }; 
		}
		if(Object.keys(rtrObj).length > 0){

			if(callBack){
				callBack(rtrObj,false);
			}else{
				var message = { "message": "some calculations are incorrect", "data": rtrObj };
				console.log(JSON.stringify(message));
				alert(JSON.stringify(message));
			}
			
		}else{
			if(callBack){
				callBack(null,true);
			}else{
				return data;
			}
			
		}
		
	}
	function verifyOverview(data,callBack){
		var ovObj = {};
		var camData = CAM_DATA || {};
		var ovReqData = camData.OVERVIEW;
		
		if(ovReqData.MONTHLY_EMI != data.MONTHLY_EMI){
			ovObj.MONTHLY_EMI = {INPUT: ovReqData.MONTHLY_EMI, OUTPUT: data.MONTHLY_EMI };
		}
		if(Object.keys(ovObj).length > 0){
			if(callBack){
				callBack(ovObj,false);
			}else{
				var message = { "message": "some calculations are incorrect", "data": ovObj };
				console.log(JSON.stringify(message));
				alert(JSON.stringify(message));
			}
		}else{
			if(callBack){
				callBack(null,true);
			}else{
				return data;
			}
		}
	}

function updateRTR(data) {

		var url = "/v2/cam/update/rtr";
		var dataObj = {
			"APPLICATION_ID": document.getElementById('appid').value,
			"LOAN_TYPE": "BL",
			"DATA": {
				"RTR": data
			}
		};
		updateCAMCalculation(dataObj, url);
}
function updateOverview(data) {

		var url = "/v2/cam/update/overview";
			var dataObj = {
				"APPLICATION_ID": document.getElementById('appid').value,
				"LOAN_TYPE": "BL",
				"DATA": {
					"OVERVIEW": data
				}
			};
			updateCAMCalculation(dataObj, url);
	}
	function updateFA(fa){
		var url = "/v2/cam/update/financialAnalysys";
			var dataObj = {
				"APPLICATION_ID": document.getElementById('appid').value,
				"LOAN_TYPE": "BL",
				"DATA": {
					"FINANCIAL_ANALYSYS": fa
				}
			};
			updateCAMCalculation(dataObj, url);
	}
	function updatePDNote(pdNote) {
		
		var url = "/v2/cam/update/pdNote";
		var dataObj = {
			"APPLICATION_ID": document.getElementById('appid').value,
			"LOAN_TYPE": "BL",
			"DATA": {
				"PD_NOTE": pdNote
			}
		};
		updateCAMCalculation(dataObj, url);
	}
	function getOVerviewInfo() {

		var ovFields = this.ovFields;
		var obj = {};
		ovFields.forEach(function (item, idx) {
			var field = item.key;
			var id = 'ov-' + field;
			var ele = document.getElementById(id);
			if (ele && ele.value) {
				obj[field] = ele.value;
			}
			if (field == "ADDRESS") {

				var keys = item.value;
				var address = [];
				keys.forEach(function (addressItem) {

					var adObj = {};
					adObj.ADDRESS_TYPE = addressItem.ADDRESS_TYPE;
					var adField1 = addressItem.key1;
					var id1 = 'ov-' + adField1 + '_1';
					var ele1 = document.getElementById(id1);
					if (ele1 && ele1.value) {
						adObj[adField1] = ele1.value;
					}
					var adField2 = addressItem.key2;
					var id2 = 'ov-' + adField2 + '_1';
					var ele2 = document.getElementById(id2);
					if (ele2 && ele2.value) {
						adObj[adField2] = ele2.value;
					}
					var adField3 = addressItem.key3;
					var id3 = 'ov-' + adField1 + '-' + adField3 + '_1';
					var ele3 = document.getElementById(id3);
					if (ele3) {
						adObj[adField3] = ele3.checked;
					}
					address.push(adObj);

				});
				obj[field] = address;
			}
			if (field == "PROMOTOR_DETAILS") {

				var keys = item.value;
				var pmDetails = [];

				keys.forEach(function (bDetails, adIdx) {

					var bObj = {};
					adIdx = adIdx + 1;
					if (adIdx == 1) {
						bObj['CUSTOMER_TYPE'] = 'COMPANY';
					} else {
						bObj['CUSTOMER_TYPE'] = 'INDIVIDUAL';
					}
					Object.values(bDetails).forEach(function (bdkey) {

						var id = 'ov-' + 'bd-' + bdkey + '-' + adIdx;
						var ele4 = document.getElementById(id);
						if (ele4 && ele4.value) {
							bObj[bdkey] = ele4.value;
						}
					});
					pmDetails.push(bObj);
				});
				obj[field] = pmDetails;
			}
			if (field == "DEVIATIONS") {
				var keys = item.value;
				var deviations = [];

				keys.forEach(function (deviation, adIdx) {

					var bObj = {};
					adIdx = adIdx + 1;
					Object.values(deviation).forEach(function (dkey) {
						var id = 'ov-DEVIATIONS_' + dkey + '-' + adIdx;
						var ele5 = document.getElementById(id);
						if (ele5 && ele5.value) {
							bObj[dkey] = ele5.value;
						}
					});
					deviations.push(bObj);
				});
				obj[field] = deviations;

			}

		});

		obj.MONTHLY_EMI = PMT((Number(obj.RATE_OF_INTEREST)/1200),Number(obj.TENURE),-Number(obj.PROPOSED_LOAN_AMOUNT));
		
		//Delete BANKING AND FA fields
		delete obj.DSCR;
		delete obj.ABB;
		delete obj.BANKING_THROUGHPUT;
		delete obj.VAT_THROUGHPUT;
		delete obj.LEVERAGE;
		delete obj.BORROWING_TO_TURNOVER_RATIO;
		delete obj.WORKING_CAPITAL_GAP;
		delete obj.TOPLINE_TREND;
		delete obj.BOTTOMLINE_TREND;
		delete obj.OPBDIT_TREND;
		delete obj.TNW_TREND;
		delete obj.CHEQUE_BOUNCE_RATIO;

		return obj;

	}
	function PMT(i, n, p) {
		return i * p * Math.pow((1 + i), n) / (1 - Math.pow((1 + i), n));
	}
	function getRTRCalculations() {
		var loansLength = 5;
		var repaymentlength = 3;
		var rtrFields = this.rtrFields;
		var loansArr = [];
		for (var i = 1; i <= loansLength; i++) {
			var obj = {};
			rtrFields.forEach(function (field) {
				var id = 'rtr-loan-' + i + '-' + field;
				var ele = document.getElementById(id);
				if (ele && field == "OVERWRITE_EMI_OBLIGATED") {
					obj[field] = ele.checked;
				} else if (ele && ele.value) {
					obj[field] = ele.value;
				}
				var schedule = [];
				if (field == 'REPAYMENT_SCHEDULE') {
					for (var j = 1; j <= repaymentlength; j++) {
						var scheduleObj = {};
						var sId_Key = 'rtr-' + field + '_' + j; //rtr-REPAYMENT_SCHEDULE_1
						var keyEle = document.getElementById(sId_Key);
						if (keyEle && keyEle.value) {

							var value = keyEle.value.split('/');
							value = value[1] + '/' + value[0] + '/' + value[2];

							var d = new Date(value);
							var locale = "en-us";
							var monthName = d.toLocaleString(locale, { month: "short" });
							var monthNum = d.getMonth() + 1;
							var fullYear = d.getFullYear();
							var shortYr = parseInt(fullYear.toString().substring(2));
							var date = d.getDate();
							scheduleObj.MONTH = monthNum;
							scheduleObj.MONTH_NAME = monthName;
							scheduleObj.YEAR = fullYear;
						}
						var sId = 'rtr-loan-' + i + '-' + field + '_' + j;//rtr-loan-1-REPAYMENT_SCHEDULE_1
						var ele = document.getElementById(sId);
						if (ele && ele.value) {

							var value = ele.value.split('/');
							value = value[1] + '/' + value[0] + '/' + value[2];

							var d = new Date(value);
							var locale = "en-us";
							var monthName = d.toLocaleString(locale, { month: "short" });
							var monthNum = d.getMonth() + 1;
							var date = d.getDate();
							scheduleObj.REPAYMENT_DATE = date;
							scheduleObj.REPAYMENT_MONTH = monthNum;
							scheduleObj.REPAYMENT_MONTH_NAME = monthName;
							schedule.push(scheduleObj);
						}
					}
					schedule.sort(function (a, b) {
						return a["YEAR"] - b["YEAR"] || a["MONTH"] - b["MONTH"];
					});
					obj[field] = schedule;
				}
			});
			loansArr.push(obj);
		}
		return loansArr;
	}
	function updateCAMCalculation(dataObj, url) {
		$.ajax({
			crossDomain: true,
			type: "POST",
			contentType: "application/json",
			beforeSend: function (request) {
				$('.ajax-loader').css("visibility", "visible");
				$('.ajax-loader').css("height", document.body.scrollHeight);

				request.setRequestHeader("api-key", "f72f0ffdad341711a9f978f5e9db448fc84733fbcb271ff7302a360debb942");
			},
			data: JSON.stringify(dataObj),
			url: document.getElementById('host').value+url,
			success: function (msg) {

				if (msg) {
					alert(JSON.stringify(msg));
				}
			},
			complete: function () {
				$('.ajax-loader').css("visibility", "hidden");
			}
		});
	}

	function updateRTRCalculations(data) {
		var totalOutStanding = 0;
		var totalInitalLoanAmout = 0;
		var totalEmi = 0;
		data.forEach(function (loanItem) {
			var cDate = new Date();
			var cYear = cDate.getFullYear();
			var cMonth = cDate.getMonth() + 1;

			var date = loanItem.START_DATE.split('/');
			date = date[1] + '/' + date[0] + '/' + date[2];
			var sDate = new Date(date);
			var sYear = sDate.getFullYear();
			var sMonth = sDate.getMonth() + 1;

			var date = loanItem.END_DATE.split('/');
			date = date[1] + '/' + date[0] + '/' + date[2];
			var eDate = new Date(date);
			var eYear = eDate.getFullYear();
			var eMonth = eDate.getMonth() + 1;

			loanItem.VINTAGE = (cYear - sYear) * 12 + cMonth - sMonth + 1;

			loanItem.BALANCE_TENURE = (eYear - sYear) * 12 + eMonth - sMonth + 1 - loanItem.VINTAGE;

			loanItem.IS_EMI_OBLIGATED = loanItem.BALANCE_TENURE >= 6 ? 'Yes' : 'No';

			totalInitalLoanAmout += Number(loanItem.INITIAL_LOAN_AMT);
			totalOutStanding += Number(loanItem.CURRENT_OUTSTANDING);
			totalEmi += Number(loanItem.EMI);
		});
		var RTR = {};
		RTR.LOAN_DATA = data;
		RTR.TOTAL_INITIAL_LOAN_AMOUNT = totalInitalLoanAmout;
		RTR.TOTAL_CURRENT_OUTSTANDING = totalOutStanding;
		RTR.TOTAL_EMI = totalEmi;

		return RTR;

	}
	function fillRTRForm(rtrData) {

		if (!rtrData) {
			return;
		}
		var loanData = rtrData.LOAN_DATA || [];
		var loansLength = 5;
		var repaymentlength = 3;
		var rtrFields = this.rtrFields;
		var loansArr = [];
		for (var i = 1; i <= loanData.length; i++) {
			var loanItem = loanData[i - 1];
			rtrFields.forEach(function (field) {
				var id = 'rtr-loan-' + i + '-' + field;
				var ele = document.getElementById(id);
				if (ele && field == "OVERWRITE_EMI_OBLIGATED") {
					ele.checked = loanItem[field]; //obj[field] = ele.checked ;
				} else if (ele) {
					ele.value = loanItem[field] || ''; //obj[field] = ele.value;
				}
				if (field == 'REPAYMENT_SCHEDULE') {
					var scheduls = loanItem[field];
					scheduls.sort(function (a, b) {
						return a["YEAR"] - b["YEAR"] || a["MONTH"] - b["MONTH"];
					});
					for (var j = 1; j <= scheduls.length; j++) {
						var repayItem = scheduls[j - 1];

						var sId_Key = 'rtr-' + field + '_' + j; //rtr-REPAYMENT_SCHEDULE_1
						var keyEle = document.getElementById(sId_Key);
						if (keyEle) {
							keyEle.value = '01' + '/' + repayItem.MONTH + '/' + repayItem.YEAR;
						}
						var sId = 'rtr-loan-' + i + '-' + field + '_' + j;//rtr-loan-1-REPAYMENT_SCHEDULE_1
						var ele = document.getElementById(sId);
						if (ele) {
							ele.value = repayItem.REPAYMENT_DATE + '/' + repayItem.REPAYMENT_MONTH + '/' + repayItem.YEAR;
						}
					}
				}
				var otherIds = 'rtr-' + field;
				var ele = document.getElementById(otherIds);
				if (ele) {
					ele.value = rtrData[field];
				}
			});
		}
	}
	function calculateFinancialAnalysys(appCamData) {
		var yearsLength = 3;
		var startYear = 2014;
		var endYear = 2016;
		var plLength = 30;
		var plArr = [];
		var faData = {};
		faData.CURRENT_FIN_YEAR = 2016;
		faData.NUMBER_OF_YEARS_AUDITED = 3;
		var PROFIT_LOSS_ACCOUNT = {};
		var BALANCE_SHEET = {};
		var FINANCIAL_YEAR_ANALYSIS = [];
		for (var i = startYear; i <= endYear; i++) {
			var obj = {};
			obj['YEAR'] = i;
			obj['MONTH'] = 31;
			obj['MONTH_NAME'] = 'MARCH';
			for (var j = 1; j <= plLength; j++) {
				var id = 'pl' + '-' + i + '-' + j;  //pl-2014-1
				var ele = document.getElementById(id);
				var key = ele.getAttribute('key');
				var value = ele.value || 0;
				obj[key] = Number(value);
			}
			plArr.push(obj);
		}
		PROFIT_LOSS_ACCOUNT['FINANCIAL_YEAR_ANALYSIS'] = plArr;
		faData['PROFIT_LOSS_ACCOUNT'] = PROFIT_LOSS_ACCOUNT;
		var bsArr = [];
		var bsLength = 40;
		for (var i = startYear; i <= endYear; i++) {
			var obj = {};
			obj['YEAR'] = i;
			obj['MONTH'] = 31;
			obj['MONTH_NAME'] = 'MARCH';
			for (var j = 1; j <= bsLength; j++) {
				var id = 'bs' + '-' + i + '-' + j;  //bs-2014-1
				var ele = document.getElementById(id);
				var key = ele.getAttribute('key');
				var value = ele.value || 0;
				obj[key] = Number(value);
			}
			bsArr.push(obj);
		}
		BALANCE_SHEET['FINANCIAL_YEAR_ANALYSIS'] = bsArr;
		faData['BALANCE_SHEET'] = BALANCE_SHEET;
		var fa = getFinancialAnalysys(faData,appCamData);
		return fa;
	}
	function fillPDNote(pdData, fa) {
		if (pdData) {
			var yearsLength = 3;
			var startYear = 2014;
			var endYear = 2016;
			var pdFields = this.pdFields;
			for (var i = 0; i < pdFields.length; i++) {
				var id = 'pd' + '-' + pdFields[i];  //pl-2014-1
				var ele = document.getElementById(id);
				if (ele) {
					ele.value = pdData[pdFields[i]] || '';
				}
			}
			updateFAFieldsOfPDNote(fa);
		}
	}
	function updateFAFieldsOfPDNote(fa) {
		var pl = fa.PROFIT_LOSS_ACCOUNT;
		var plYear = pl.FINANCIAL_YEAR_ANALYSIS;
		for (var i = 0; i < plYear.length; i++) {
			Object.keys(plYear[i]).forEach(function (key) {
				var id = 'pd' + '-' + plYear[i].YEAR + '-' + key;
				var ele = document.getElementById(id);
				if (ele) {
					ele.value = plYear[i][key] || '';
				}
			});
		}
		var bs = fa.BALANCE_SHEET;
		var bsYear = bs.FINANCIAL_YEAR_ANALYSIS;
		for (var i = 0; i < bsYear.length; i++) {
			Object.keys(bsYear[i]).forEach(function (key) {
				var id = 'pd' + '-' + bsYear[i].YEAR + '-' + key;
				var ele = document.getElementById(id);
				if (ele) {
					ele.value = bsYear[i][key] || '';
				}
			});
		}
		var ratios = fa.RATIOS;
		for (var i = 0; i < ratios.length; i++) {
			Object.keys(ratios[i]).forEach(function (key) {
				var id = 'pd' + '-' + ratios[i].YEAR + '-' + key;
				var ele = document.getElementById(id);
				if (ele) {
					ele.value = ratios[i][key] || '';
				}
			});
		}
	}
	function updateFinancialAnalysys(fa) {
		if (!fa) {
			return;
		}
		var yearsLength = 3;
		var startYear = 2014;
		var endYear = 2016;
		var plLength = 30;
		var bsLength = 40;

		var plData = fa.PROFIT_LOSS_ACCOUNT;
		var fy = plData.FINANCIAL_YEAR_ANALYSIS;
		var yoy = plData.FINANCIAL_YEAR_ANALYSIS_YOY;

		for (var i = startYear; i <= endYear; i++) {
			var yearData = fy.filter(function (item) {
				return item.YEAR == i;
			});
			for (var j = 1; j <= plLength; j++) {
				var id = 'pl' + '-' + i + '-' + j;  //pl-2014-1
				var ele = document.getElementById(id);
				var key = ele.getAttribute('key');
				ele.value = yearData[0][key];
			}
		}
		for (var i = 0; i < yoy.length; i++) {
			var yoyData = yoy.filter(function (item) {
				return item.FROM_YEAR == yoy[i].FROM_YEAR;
			});
			for (var j = 1; j <= plLength; j++) {
				var id = 'pl' + '-' + yoyData[0].FROM_YEAR + '-' + yoyData[0].TO_YEAR + '-' + j;  //pl-2014-2015-1
				var ele = document.getElementById(id);
				var key = ele.getAttribute('key');
				ele.value = yoyData[0][key];
			}

		}

		var bsData = fa.BALANCE_SHEET;
		var fy = bsData.FINANCIAL_YEAR_ANALYSIS;
		var yoy = bsData.FINANCIAL_YEAR_ANALYSIS_YOY;
		for (var i = startYear; i <= endYear; i++) {
			var yearData = fy.filter(function (item) {
				return item.YEAR == i;
			});
			for (var j = 1; j <= bsLength; j++) {
				var id = 'bs' + '-' + i + '-' + j;  //pl-2014-1
				var ele = document.getElementById(id);
				var key = ele.getAttribute('key');
				ele.value = yearData[0][key];
			}
		}
		for (var i = 0; i < yoy.length; i++) {
			var yoyData = yoy.filter(function (item) {
				return item.FROM_YEAR == yoy[i].FROM_YEAR;
			});
			for (var j = 1; j <= bsLength; j++) {
				var id = 'bs' + '-' + yoyData[0].FROM_YEAR + '-' + yoyData[0].TO_YEAR + '-' + j;  //pl-2014-2015-1
				var ele = document.getElementById(id);
				var key = ele.getAttribute('key');
				ele.value = yoyData[0][key];
			}

		}
		var ratios = fa.RATIOS;
		var rLength = 15;
		for (var i = 0; i < ratios.length; i++) {
			var raData = ratios.filter(function (item) {
				return item.YEAR == ratios[i].YEAR;
			});
			for (var j = 1; j <= rLength; j++) {
				var id = 'ra' + '-' + raData[0].YEAR + '-' + j;  //pl-2014-2015-1
				var ele = document.getElementById(id);
				var key = ele.getAttribute('key');
				ele.value = raData[0][key];
			}
		}
		var cPosition = fa.CASH_POSITION;
		var cpLength = 18;
		for (var i = 0; i < cPosition.length; i++) {
			var cpData = cPosition.filter(function (item) {
				return item.YEAR == cPosition[i].YEAR;
			});
			for (var j = 1; j <= cpLength; j++) {
				var id = 'cp' + '-' + cpData[0].YEAR + '-' + j;  //pl-2014-2015-1
				var ele = document.getElementById(id);
				var key = ele.getAttribute('key');
				ele.value = cpData[0][key];
			}
		}
		var dscrCal = fa.DSCR_CALCULATION || {};
		var accurals = dscrCal.CASH_ACCRUALS || {};
		var obligations = dscrCal.OBLIGATIONS || {};
		var computation = accurals.COMPUTATION || {};
		var yearly = accurals.YEARLY || {};

		var obComputation = obligations.COMPUTATION || {};
		var obYearly = obligations.YEARLY || {};

		var dscrLength = 11;
		for (var j = 1; j <= dscrLength; j++) {
			var id = 'dscr' + '-ca-c-' + j;  
			var ele = document.getElementById(id);
			if(ele){
				var key = ele.getAttribute('key');
				ele.value = computation[key];
			}
			var id1 = 'dscr' + '-ca-y-' + j;  
			var ele = document.getElementById(id1);
			if(ele){
				var key1 = ele.getAttribute('key');
				ele.value = yearly[key1];
			}

			var id = 'dscr' + '-ob-c-' + j;  
			var ele = document.getElementById(id);
			if(ele){
				var key = ele.getAttribute('key');
				ele.value = obComputation[key];
			}
			var id1 = 'dscr' + '-ob-y-' + j;  
			var ele = document.getElementById(id1);
			if(ele){
				var key1 = ele.getAttribute('key');
				ele.value = obYearly[key1];
			}
		}
		document.getElementById('DSCR_TOTAL').value = dscrCal.DSCR_TOTAL;

	}
	function getPercentageChange(fromYear, toYear) {
		var value = ((toYear - fromYear) / fromYear) * 100;
		//value  = Number(value.toFixed(2));
		return value;
	}
	function getFinancialAnalysys(faData, appCamData) {

		if (!faData) {
			return;
		}
		var FINANCIAL_ANALYSYS = {};
		FINANCIAL_ANALYSYS.CURRENT_FIN_YEAR = faData.CURRENT_FIN_YEAR;
		FINANCIAL_ANALYSYS.NUMBER_OF_YEARS_AUDITED = faData.NUMBER_OF_YEARS_AUDITED;
		var profitLosAccount = faData.PROFIT_LOSS_ACCOUNT || {};
		var yearAnalysys = profitLosAccount.FINANCIAL_YEAR_ANALYSIS || [];
		yearAnalysys.sort(function (a, b) {
			return a.YEAR - b.YEAR;
		});
		yearAnalysys.forEach(function (item) {

			item.NET_SALES = item.GROSS_SALES_OR_RECEIPTS - item.EXCISE_DUTY_SALES_TAX_OTHER_INDIRECT_TAX;
			item.TOTAL_OPERATING_INCOME = item.NET_SALES + item.OTHER_INCOME;
			item.TOTAL_COST_OF_GOODS = item.OP_STOCK + item.PURCHASES - item.LESS_CLOSING_STOCK + item.DIRECT_EXPENCES;
			item.TOTAL_INDIRECT_EXPENSES = item.MISCELLANEOUS_DEFERRED_REVENUE_EXPENSES_WRITTEN_OFF + item.SELLING_GENERAL_ADMIN_EXPENCES;
			item.OPBDIT = item.TOTAL_OPERATING_INCOME - item.TOTAL_COST_OF_GOODS - item.TOTAL_INDIRECT_EXPENSES;
			item.OPBIT = item.OPBDIT - item.DEPRECIATION_AND_AMORTISATION;
			item.OPBT = item.OPBIT - item.INTEREST_ON_LOANS - item.OTHER_INTEREST;
			item.PROFIT_BEFORE_TAX = item.OPBT + item.NON_OPERATING_INCOME - item.NON_OPERATING_EXPENSES;
			item.PAT = item.PROFIT_BEFORE_TAX - item.TAX;
			item.CASH_PROFIT = item.DEPRECIATION_AND_AMORTISATION + item.PAT +
				item.DIVIDEND + item.SALARY_TO_PARTNER_OR_DIRECTOR +
				item.OTHER_PAYMENTS_TO_PARTNER_OR_DIRECTOR_IE_RENT +
				item.INTEREST_EXPENSES_PAID_TO_PARTNERS_OR_DIRECTOR +
				item.TRANSFER_TO_RESERVES;
		});
		var yoy = [];
		for (var i = 0; i < yearAnalysys.length - 1; i++) {
			var changeYoy = {};
			var fromYear = yearAnalysys[i];
			var toYear = yearAnalysys[i + 1];
			changeYoy.FROM_YEAR = fromYear.YEAR;
			changeYoy.TO_YEAR = toYear.YEAR;
			Object.keys(fromYear).forEach(function (key1) {
				if (key1 != "DATE" && key1 != "MONTH" && key1 != "MONTH_NAME" && key1 != 'YEAR' && key1 != "IS_AUDITED") {
					Object.keys(toYear).forEach(function (key2) {
						if (key1 == key2 && fromYear[key1] && toYear[key2]) {
							var value = getPercentageChange(fromYear[key1], toYear[key2]);	
							changeYoy[key1] = value;
						}
					})
				}
			});
			yoy.push(changeYoy);
		}
		var PROFIT_LOSS_ACCOUNT = {};
		PROFIT_LOSS_ACCOUNT.FINANCIAL_YEAR_ANALYSIS = yearAnalysys;
		PROFIT_LOSS_ACCOUNT.FINANCIAL_YEAR_ANALYSIS_YOY = yoy;
		FINANCIAL_ANALYSYS.PROFIT_LOSS_ACCOUNT = PROFIT_LOSS_ACCOUNT;

		var balanceSheet = faData.BALANCE_SHEET || {};
		var balanceYearAnalysys = balanceSheet.FINANCIAL_YEAR_ANALYSIS || [];
		balanceYearAnalysys.sort(function (a, b) {
			return a.YEAR - b.YEAR;
		});
		balanceYearAnalysys.forEach(function (item) {
			item.NET_WORTH = item.EQUITY_AND_PREFERENCE_SHARE_CAPITAL +
				item.QUASI_EQUITY +
				item.GENERAL_RESERVE_SHARE_PREMIUM_RESERVE_AND_OTHER_RESERVES;
			item.TANGIBLE_NETWORTH = (item.NET_WORTH) - (item.REVALUATION_RESERVE) - (item.NET_INTANGIBLES) - (item.MISCELLANEOUS_DEFERRED_REVENUE_EXPENSES_NOT_WRITTEN_OFF);
			item.TOTAL_LONG_TERM_DEBT = item.BORROWINGS_FROM_AFFILIATES_ASSOCIATES + item.LONG_TERM_BORROWINGS_FROM_BANKS_NBFCS + item.OTHER_LONG_TERM_BORROWINGS;
			item.TOTAL_CURRENT_LIABILITIES = item.CURRENT_MATURITIES_OF_LONG_TERM_DEBT +
				item.CREDITORS_AND_BILLS_PAYABLE +
				item.ADVANCES_RECEIVED_FROM_DEBTORS_CUSTOMERS +
				item.WORKING_CAPITAL_LIMIT_FROM_BANKS +
				item.PROVISION_FOR_TAXATION +
				item.OTHER_CL;
			item.TOTAL_LIABILITIES_TO_OUTSIDERS = item.TOTAL_LONG_TERM_DEBT + item.TOTAL_CURRENT_LIABILITIES;
			item.BALANCE_SHEET_TOTAL1 = item.NET_WORTH + item.TOTAL_LIABILITIES_TO_OUTSIDERS;
			item.NET_BLOCK_OF_FIXED_ASSETS = item.GROSS_BLOCK_OF_FIXED_ASSETS - item.LESS_DEPRECIATION;
			item.RECEIVABLES_DEBTORS = item.DEBTORS_GREATER_THAN_6_MONTHS + item.DEBTORS_LESS_THAN_6_MONTHS;
			item.LOANS_AND_ADVANCES = item.RETENTION_MONEY_OR_SECURITY_DEPOSIT_OR_EMD_MONEY +
				item.ADVANCES_GIVEN_TO_SUPPLIERS +
				item.LOANS_AND_ADVANCES_GIVEN_TO_DIRECTORS_OR_PARTNERS_ETC +
				item.LOANS_AND_ADVANCES_GIVEN_TO_OTHERS;
			item.CURRENT_ASSETS = item.DEFERRED_TAX_ASSET +
				item.INVENTORIES +
				item.RECEIVABLES_DEBTORS +
				item.CASH_AND_BANK +
				item.LOANS_AND_ADVANCES;
			item.BALANCE_SHEET_TOTAL2 = item.NET_BLOCK_OF_FIXED_ASSETS +
				item.CAPITAL_WORK_IN_PROGRESS +
				item.MISCELLANEOUS_DEFERRED_REVENUE_EXPENDITURE_NOT_WRITTEN_OFF +
				item.INVESTMENTS +
				item.CURRENT_ASSETS;
		});
		var balanceSheetYoy = [];
		for (var i = 0; i < balanceYearAnalysys.length - 1; i++) {
			var changeYoy = {};
			var fromYear = balanceYearAnalysys[i];
			var toYear = balanceYearAnalysys[i + 1];
			changeYoy.FROM_YEAR = fromYear.YEAR;
			changeYoy.TO_YEAR = toYear.YEAR;
			Object.keys(fromYear).forEach(function (key1) {
				if (key1 != "DATE" && key1 != "MONTH" && key1 != "MONTH_NAME" && key1 != 'YEAR' && key1 != "IS_AUDITED") {
					Object.keys(toYear).forEach(function (key2) {
						if (key1 == key2 && fromYear[key1] && toYear[key2]) {
							var value = getPercentageChange(fromYear[key1], toYear[key2]);
							changeYoy[key1] = value;
						}
					})
				}
			});
			balanceSheetYoy.push(changeYoy);
		}
		var BALANCE_SHEET = {};
		BALANCE_SHEET.FINANCIAL_YEAR_ANALYSIS = balanceYearAnalysys;
		BALANCE_SHEET.FINANCIAL_YEAR_ANALYSIS_YOY = balanceSheetYoy;
		FINANCIAL_ANALYSYS.BALANCE_SHEET = BALANCE_SHEET;

		//RATIOS:
		var ratios = [];
		var profit_los_fa = FINANCIAL_ANALYSYS.PROFIT_LOSS_ACCOUNT.FINANCIAL_YEAR_ANALYSIS;
		var balanceSheet_fa = FINANCIAL_ANALYSYS.BALANCE_SHEET.FINANCIAL_YEAR_ANALYSIS;
		for (var i = 0; i < profit_los_fa.length; i++) {
			for (var j = 0; j < balanceSheet_fa.length; j++) {
				if (profit_los_fa[i].YEAR == balanceSheet_fa[j].YEAR) {
					var ratioYear = {};
					ratioYear.YEAR = profit_los_fa[i].YEAR;
					ratioYear.TOL_OR_TNW = (balanceSheet_fa[j].TOTAL_LIABILITIES_TO_OUTSIDERS) / (balanceSheet_fa[j].TANGIBLE_NETWORTH);
					ratioYear.EBIDTA_OR_INTREST = (profit_los_fa[i].OPBDIT) / (profit_los_fa[i].INTEREST_ON_LOANS);
					ratioYear.CREDITORS_TURNOVER_DAYS = ((balanceSheet_fa[j].CREDITORS_AND_BILLS_PAYABLE) / (profit_los_fa[i].TOTAL_COST_OF_GOODS)) * 365;
					ratioYear.NET_WORKING_CAPITAL = balanceSheet_fa[j].DEBTORS_GREATER_THAN_6_MONTHS +
						balanceSheet_fa[j].DEBTORS_LESS_THAN_6_MONTHS +
						balanceSheet_fa[j].INVENTORIES +
						balanceSheet_fa[j].RETENTION_MONEY_OR_SECURITY_DEPOSIT_OR_EMD_MONEY +
						balanceSheet_fa[j].ADVANCES_GIVEN_TO_SUPPLIERS -
						balanceSheet_fa[j].CREDITORS_AND_BILLS_PAYABLE -
						balanceSheet_fa[j].WORKING_CAPITAL_LIMIT_FROM_BANKS -
						balanceSheet_fa[j].ADVANCES_RECEIVED_FROM_DEBTORS_CUSTOMERS;
					ratioYear.AVG_COLLECTION_PERIOD_OR_AVG_DEBTOR_DAYS = ((balanceSheet_fa[j].RECEIVABLES_DEBTORS - balanceSheet_fa[j].DEBTORS_GREATER_THAN_6_MONTHS) / (profit_los_fa[i].GROSS_SALES_OR_RECEIPTS)) * 365;
					ratioYear.AVERAGE_DAYS_IN_INVENTORY = ((balanceSheet_fa[j].INVENTORIES) * 365) / (profit_los_fa[i].NET_SALES);
					ratioYear.CURRENT_RATIO = (balanceSheet_fa[j].CURRENT_ASSETS) / (balanceSheet_fa[j].TOTAL_CURRENT_LIABILITIES);
					ratioYear.LIQUIDITY_RATIO = (balanceSheet_fa[j].CURRENT_ASSETS - balanceSheet_fa[j].INVENTORIES) / (balanceSheet_fa[j].CREDITORS_AND_BILLS_PAYABLE);
					ratioYear.LONG_TERM_DEBT_EQUITY_RATIO = (balanceSheet_fa[j].TOTAL_LONG_TERM_DEBT) / (balanceSheet_fa[j].TANGIBLE_NETWORTH);
					ratioYear.INTEREST_COVERAGE_RATIO = (profit_los_fa[i].PAT + profit_los_fa[i].DEPRECIATION_AND_AMORTISATION + profit_los_fa[i].INTEREST_ON_LOANS) / (profit_los_fa[i].INTEREST_ON_LOANS);
					ratioYear.GROSS_PROFIT_MARGIN_RATIO = ((profit_los_fa[i].TOTAL_OPERATING_INCOME - profit_los_fa[i].TOTAL_COST_OF_GOODS) / (profit_los_fa[i].GROSS_SALES_OR_RECEIPTS)) * 100;
					ratioYear.NET_PROFIT_MARGIN_RATIO = ((profit_los_fa[i].PAT) / (profit_los_fa[i].NET_SALES)) * 100;
					ratioYear.CASH_PROFIT_RATIO = ((profit_los_fa[i].CASH_PROFIT) / (profit_los_fa[i].NET_SALES)) * 100;
					ratios.push(ratioYear);
				}
			}
		}
		for (var i = profit_los_fa.length - 1; i > 0; i--) {
			var toYear = profit_los_fa[i];
			var fromYear = profit_los_fa[i - 1];
			var GROWTH_IN_SALES = 0;
			var GROWTH_IN_PAT = 0;
			if (fromYear.NET_SALES && toYear.NET_SALES) {
				GROWTH_IN_SALES = getPercentageChange(fromYear.NET_SALES, toYear.NET_SALES);
			}
			if (fromYear.PAT && toYear.PAT) {
				GROWTH_IN_PAT = getPercentageChange(fromYear.PAT, toYear.PAT);
			}
			ratios.forEach(function (ratioItem) {
				if (ratioItem.YEAR == toYear.YEAR) {
					ratioItem.GROWTH_IN_SALES = GROWTH_IN_SALES;
					ratioItem.GROWTH_IN_PAT = GROWTH_IN_PAT;
				}
			});
		}
		FINANCIAL_ANALYSYS.RATIOS = ratios;
		// //CASH_POSITION
		var cashPosition = [];
		var profit_los_fa = FINANCIAL_ANALYSYS.PROFIT_LOSS_ACCOUNT.FINANCIAL_YEAR_ANALYSIS;
		var balanceSheet_fa = FINANCIAL_ANALYSYS.BALANCE_SHEET.FINANCIAL_YEAR_ANALYSIS;
		profit_los_fa.forEach(function (item) {
			var positionYear = {};
			positionYear.YEAR = item.YEAR;
			positionYear.NET_PROFIT_AFTER_TAX = item.PAT;
			positionYear.ADD = item.ADD || 0;//TODO:check with Ranjit
			positionYear.DEPRECIATION = item.DEPRECIATION_AND_AMORTISATION;
			positionYear.SALARY_PAID_TO_PROMOTER_OR_PARTNERS = item.SALARY_TO_PARTNER_OR_DIRECTOR;
			positionYear.INTEREST_PAID_TO_PROMOTERS = item.INTEREST_EXPENSES_PAID_TO_PARTNERS_OR_DIRECTOR;
			positionYear.PROVISION_FOR_TAX = item.TAX;
			positionYear.INTEREST = item.INTEREST_ON_LOANS;
			positionYear.LESS_OTHER_INCOME_NON_BUSINESS_INCOME = -(item.NON_OPERATING_INCOME);
			positionYear.LESS_TAXE_PAID = item.TAX;
			cashPosition.push(positionYear);

		});
		balanceSheet_fa.forEach(function (item) {
			var value = item.MISCELLANEOUS_DEFERRED_REVENUE_EXPENDITURE_NOT_WRITTEN_OFF;
			cashPosition.forEach(function (position) {
				if (item.YEAR == position.YEAR) {
					position.MISC_EXPENSES_WRITTEN_OFF_OR_NON_CASH_EXPENSES = value;
					position.OPERATING_CASH_PROFIT_LOSS_BEFORE_WORKING_CAPITAL_CHANGES = position.NET_PROFIT_AFTER_TAX +
						position.ADD +
						position.DEPRECIATION +
						position.MISC_EXPENSES_WRITTEN_OFF_OR_NON_CASH_EXPENSES +
						position.SALARY_PAID_TO_PROMOTER_OR_PARTNERS +
						position.INTEREST_PAID_TO_PROMOTERS +
						position.PROVISION_FOR_TAX +
						position.INTEREST +
						position.LESS_OTHER_INCOME_NON_BUSINESS_INCOME;
				}
			});
		});
		for (var i = 0; i < balanceSheet_fa.length - 1; i++) {
			var fromYear = balanceSheet_fa[i];
			var toYear = balanceSheet_fa[i + 1];

			var TRADE_AND_OTHER_RECEIVABLES = fromYear.RECEIVABLES_DEBTORS - toYear.RECEIVABLES_DEBTORS;
			var INVENTORIES = fromYear.INVENTORIES - toYear.INVENTORIES;
			var LOANS_AND_ADVANCES = fromYear.LOANS_AND_ADVANCES - toYear.LOANS_AND_ADVANCES;
			var OTHER_CURRENT_LIABILITIES = toYear.TOTAL_CURRENT_LIABILITIES - fromYear.TOTAL_CURRENT_LIABILITIES;
			var TOTAL = TRADE_AND_OTHER_RECEIVABLES + INVENTORIES + LOANS_AND_ADVANCES + OTHER_CURRENT_LIABILITIES;

			cashPosition.forEach(function (position) {
				if (toYear.YEAR == position.YEAR) {
					position.TRADE_AND_OTHER_RECEIVABLES = TRADE_AND_OTHER_RECEIVABLES;
					position.INVENTORIES = INVENTORIES;
					position.LOANS_AND_ADVANCES = LOANS_AND_ADVANCES;
					position.OTHER_CURRENT_LIABILITIES = OTHER_CURRENT_LIABILITIES;
					position.TOTAL = TOTAL;
					position.CASH_GENERATED_FROM_OPERATIONS = position.OPERATING_CASH_PROFIT_LOSS_BEFORE_WORKING_CAPITAL_CHANGES + position.TOTAL;
					position.NET_CASH_FROM_OPERATIONS = position.CASH_GENERATED_FROM_OPERATIONS - position.LESS_TAXE_PAID;
				}
			});

		}
		FINANCIAL_ANALYSYS.CASH_POSITION = cashPosition;

		//DSCR Calculation
		var DSCR_CALCULATION = {};
		var CASH_ACCRUALS = {};
		var OBLIGATIONS = {};
		var length = profit_los_fa.length;
		var item = profit_los_fa[length - 1];
		if (item) {
			var computation = {};
			computation.PAT = item.PAT;
			computation.DEPRECIATION = item.DEPRECIATION_AND_AMORTISATION;
			computation.INTEREST_ON_PARTNERS_CAPITAL = item.INTEREST_EXPENSES_PAID_TO_PARTNERS_OR_DIRECTOR;
			computation.SALARIES_TO_PARTNERS_OR_DIRECTORS_REMUNERATION = item.SALARY_TO_PARTNER_OR_DIRECTOR;
			computation.INTEREST_PAID_ON_ALL_LOANS = item.INTEREST_ON_LOANS;
			var yearly = {};
			yearly.PAT = computation.PAT;
			yearly.DEPRECIATION = computation.DEPRECIATION;
			yearly.INTEREST_ON_PARTNERS_CAPITAL = computation.INTEREST_ON_PARTNERS_CAPITAL;
			yearly.SALARIES_TO_PARTNERS_OR_DIRECTORS_REMUNERATION = computation.SALARIES_TO_PARTNERS_OR_DIRECTORS_REMUNERATION;
			yearly.INTEREST_PAID_ON_ALL_LOANS = computation.INTEREST_PAID_ON_ALL_LOANS;
			yearly.TOTAL = yearly.PAT +
				yearly.DEPRECIATION +
				yearly.INTEREST_ON_PARTNERS_CAPITAL +
				yearly.SALARIES_TO_PARTNERS_OR_DIRECTORS_REMUNERATION +
				yearly.INTEREST_PAID_ON_ALL_LOANS;

			CASH_ACCRUALS.YEARLY = yearly;
			CASH_ACCRUALS.COMPUTATION = computation;
			DSCR_CALCULATION.CASH_ACCRUALS = CASH_ACCRUALS;


			//check with Karthikeya whether we need to save them or not
			var rtr = appCamData.RTR;
			var overview = appCamData.OVERVIEW;
			//var finAnlData = appCamData.FINANCIAL_ANALYSYS;
			//var dscrData = faData.DSCR_CALCULATION;
			//var obligations = dscrData.OBLIGATIONS || {};

			OBLIGATIONS.COMPUTATION = {};
			OBLIGATIONS.COMPUTATION.ALL_RETAIL_OBLIGATIONS = Number(rtr.TOTAL_EMI);
			OBLIGATIONS.COMPUTATION.INTEREST_ON_CC_FACILITY = 0;//TODO:will come from Banking and VAT
			OBLIGATIONS.COMPUTATION.PROPOSED_INCRED_EMI = Number(overview.MONTHLY_EMI);	
			//OBLIGATIONS.COMPUTATION.INTEREST_PAID_ON_ALL_LOANS = obligations.COMPUTATION.INTEREST_PAID_ON_ALL_LOANS;

			OBLIGATIONS.YEARLY = {};
			OBLIGATIONS.YEARLY.ALL_RETAIL_OBLIGATIONS = (rtr.TOTAL_EMI*12);
			OBLIGATIONS.YEARLY.INTEREST_ON_CC_FACILITY = 0;//TODO:will come from Banking and VAT
			OBLIGATIONS.YEARLY.PROPOSED_INCRED_EMI = (overview.MONTHLY_EMI*12);
			//OBLIGATIONS.YEARLY.INTEREST_PAID_ON_ALL_LOANS = (obligations.YEARLY.INTEREST_PAID_ON_ALL_LOANS*12);
			// OBLIGATIONS.YEARLY.TOTAL = OBLIGATIONS.YEARLY.ALL_RETAIL_OBLIGATIONS+OBLIGATIONS.COMPUTATION.INTEREST_ON_CC_FACILITY
			// 					+OBLIGATIONS.YEARLY.PROPOSED_INCRED_EMI
			// 					+OBLIGATIONS.YEARLY.INTEREST_PAID_ON_ALL_LOANS;

			OBLIGATIONS.YEARLY.TOTAL = OBLIGATIONS.YEARLY.ALL_RETAIL_OBLIGATIONS+OBLIGATIONS.COMPUTATION.INTEREST_ON_CC_FACILITY
								+OBLIGATIONS.YEARLY.PROPOSED_INCRED_EMI;
								

			DSCR_CALCULATION.OBLIGATIONS = OBLIGATIONS;
			DSCR_CALCULATION.DSCR_TOTAL = CASH_ACCRUALS.YEARLY.TOTAL/OBLIGATIONS.YEARLY.TOTAL;

		}
		FINANCIAL_ANALYSYS.DSCR_CALCULATION = DSCR_CALCULATION;
		return FINANCIAL_ANALYSYS;
	}
});
