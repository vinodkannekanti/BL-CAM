var pdFields = [
    "NAME_OF_THE_ENTITY",
    "ADDRESS",
    "CITY",
    "CONSTITUTION",
    "NATURE_OF_BUSINESS",
    "INDUSTRY",
    "PROMOTER_COMPANY_PROFILE",
    "BUSINESS_SET_UP_CURRENT_BUSINESS_DEVELOPMENTS",
    "GROUP_COMPANY_DETAILS",
    "NUMBER_OF_EMPLOYEES",
    "BUSINESS_BOARD_SIGHTED",
    "OFFICE_OWNERSHIP",
    "CUSTOMER_FOOTFALL",
    "NET_SALES",
    "AVG_COLLECTION_PERIOD_OR_AVG_DEBTOR_DAYS",
    "OPBDIT",
    "CREDITORS_TURNOVER_DAYS",
    "NET_WORTH",
    "AVERAGE_DAYS_IN_INVENTORY",
    "TOL_OR_TNW",
    "NET_WORKING_CAPITAL",
    "FINANCIAL_BANKING_ANALYSIS",
    "EXISTING_LOANS_REPAYMENT_BEHAVIOUR",
    "END_USE_OF_FUNDS",
    "CONCERNS_DEVIATIONS",
    "MITIGATIONS",
    "CREDIT_DECISION",
    "NAME_DESIGNATION_OFFICIAL_VISITED",
    "DATE_OF_VISIT",
    "PD_CONDUCTED_BY"
];
var rtrFields = [
    "LENDER_NAME",
    "PRODUCT",
    "INITIAL_LOAN_AMT",
    "CURRENT_OUTSTANDING",
    "START_DATE",
    "END_DATE",
    "VINTAGE",
    "BALANCE_TENURE",
    "IS_EMI_OBLIGATED",
    "OVERWRITE_EMI_OBLIGATED",
    "EMI",
    "NUMBER_OF_BOUNCES",
    "ACCOUNT_NUMBER",
    "COMMENTS",
    "REPAYMENT_SCHEDULE",
    "TOTAL_INITIAL_LOAN_AMOUNT",
    "TOTAL_CURRENT_OUTSTANDING",
    "TOTAL_EMI"
];
var ovFields = [
    { "key": "CASE_NAME" },

    { "key": "APPLICATION_ID" },
    { "key": "SALES_MANAGER" },
    { "key": "PARTNER_TYPE" },
    { "key": "LOAN_SCHEME" },
    { "key": "CONSTITUTION" },
    { "key": "LOCATION" },
    { "key": "DST" },
    { "key": "PARTNER_NAME" },
    { "key": "NATURE_OF_BUSINESS" },
    { "key": "INDUSTRY" },
    { "key": "FI_REQUIRED" },
    {
        "key": "ADDRESS", "value": [
            { "ADDRESS_TYPE": "Office Address", "key1": "OFFICE_OWNERSHIP", "key2": "OFFICE_ADDRESS", "key3": "FI_REQUIRED" },
            { "ADDRESS_TYPE": "Registered Address", "key1": "RESIDENCE_OWNERSHIP", "key2": "RESIDENCE_ADDRESS", "key3": "FI_REQUIRED" },
            { "ADDRESS_TYPE": "Factory Address", "key1": "FACTORY_OWNERSHIP", "key2": "FACTORY_ADDRESS", "key3": "FI_REQUIRED" }
        ]
    },
    { "key": "FIRST_TIME_BORROWER_UN_SECURED_LOAN" },
    { "key": "COMPANY_WEBSITE" },
    { "key": "AVAILING_OD_CC_LIMIT" },
    {
        "key": "PROMOTOR_DETAILS", "value": [{

            "key1": "NAME",
            "key2": "RELATION_WITH",
            "key3": "RELATIONSHIP",
            "key4": "DOB",
            "key5": "PERCENTAGE_STAKE_HOLDING",
            "key6": "EDUCATIONAL_QUALIFICATIONS",
            "key7": "WORKING_SINCE",
            "key8": "WORK_INDUSTRY_EXPERIENCE",
            "key9": "CIBIL_SCORE",
            "key10": "LINKEDIN",
            "key11":'APPLICANT_TYPE',
            "key12":'CUSTOMER_TYPE'
            
        },
        {
            "key1": "NAME",
            "key2": "RELATION_WITH",
            "key3": "RELATIONSHIP",
            "key4": "DOB",
            "key5": "PERCENTAGE_STAKE_HOLDING",
            "key6": "EDUCATIONAL_QUALIFICATIONS",
            "key7": "WORKING_SINCE",
            "key8": "WORK_INDUSTRY_EXPERIENCE",
            "key9": "CIBIL_SCORE",
            "key10": "LINKEDIN",
            "key11":'APPLICANT_TYPE',
            "key12":'CUSTOMER_TYPE'
        },
        {
            "key1": "NAME",
            "key2": "RELATION_WITH",
            "key3": "RELATIONSHIP",
            "key4": "DOB",
            "key5": "PERCENTAGE_STAKE_HOLDING",
            "key6": "EDUCATIONAL_QUALIFICATIONS",
            "key7": "WORKING_SINCE",
            "key8": "WORK_INDUSTRY_EXPERIENCE",
            "key9": "CIBIL_SCORE",
            "key10": "LINKEDIN",
            "key11":'APPLICANT_TYPE',
            "key12":'CUSTOMER_TYPE'
        },
        {
            "key1": "NAME",
            "key2": "RELATION_WITH",
            "key3": "RELATIONSHIP",
            "key4": "DOB",
            "key5": "PERCENTAGE_STAKE_HOLDING",
            "key6": "EDUCATIONAL_QUALIFICATIONS",
            "key7": "WORKING_SINCE",
            "key8": "WORK_INDUSTRY_EXPERIENCE",
            "key9": "CIBIL_SCORE",
            "key10": "LINKEDIN",
            "key11":'APPLICANT_TYPE',
            "key12":'CUSTOMER_TYPE'
        }]
    },
    { "key": "GOOGLE_SEARCH" },
    { "key": "WATCHOUT_INVESTOR" },
    { "key": "BIFR" },
    { "key": "RBI_DEFAULTER_LIST" },
    { "key": "PROPOSED_LOAN_AMOUNT" },
    { "key": "RATE_OF_INTEREST" },
    { "key": "TENURE" },
    { "key": "MONTHLY_EMI" },
    { "key": "DSCR_TOTAL" },
    { "key": "ABB" },
    { "key": "BANKING_THROUGHPUT" },
    { "key": "VAT_THROUGHPUT" },
    { "key": "LEVERAGE" },
    { "key": "BORROWING_TO_TURNOVER_RATIO" },
    { "key": "WORKING_CAPITAL_GAP" },
    { "key": "TOPLINE_TREND" },
    { "key": "BOTTOMLINE_TREND" },
    { "key": "OPBDIT_TREND" },
    { "key": "TNW_TREND" },
    { "key": "CHEQUE_BOUNCE_RATIO" },
    { "key": "DEVIATIONS","value": [{ "key1": "DESC", "key2": "CODE" },{ "key1": "DESC", "key2": "CODE" },{ "key1": "DESC", "key2": "CODE" }]}
];