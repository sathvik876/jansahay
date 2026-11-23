const rule = (field, operator, value, label) => ({ field, operator, value, label });
const confirm = (field, label) => rule(field, 'eq', true, label);
const age = (value) => rule('age', 'min', value, 'Age ' + value + ' or older');

export const schemes = [
  ['epass','Telangana ePASS Post-Matric Scholarship','Students','Telangana','Tuition reimbursement and maintenance support for eligible post-matric students.',
    'scholarship college student education tuition fees fee reimbursement తెలంగాణ విద్య కళాశాల ఫీజు స్కాలర్‌షిప్ చదువు छात्रवृत्ति कॉलेज पढ़ाई फीस',
    'https://telanganaepass.cgg.gov.in/WhoareEligible.do','https://telanganaepass.cgg.gov.in/epassonlinelinks.jsp',
    [rule('state','eq','Telangana','Telangana applicant'),rule('income','epassIncome',null,'Meet the annual family income limit for your welfare category'),
      confirm('epassCourse','Eligible post-matric course and institution'),confirm('epassAge','Meet the portal’s age, admission, attendance and other scholarship rules')],
    ['SSC hall ticket and passing details','Aadhaar or enrollment details as directed by ePASS','MeeSeva income and caste certificates as applicable','Study or bonafide certificate','Admission or CET allotment records where applicable','Bank account details if required for your category'],
    ['Open Post Matric Scholarship Services and check the current registration notice.','Choose fresh registration or renewal.','Complete the portal steps and follow your institution’s verification instructions.']],
  ['csss','PM-USP Central Sector Scholarship','Students','India','Scholarship support for eligible college and university students.',
    'scholarship college student education fees tuition కళాశాల ఫీజు విద్య స్కాలర్‌షిప్ छात्रवृत्ति छात्र फीस कॉलेज',
    'https://www.education.gov.in/sites/upload_files/mhrd/files/upload_document/PM_USP_CSSS_guidelines.pdf','https://scholarships.gov.in/',
    [rule('income','max',450000,'Annual family income of ₹4.5 lakh or less'),confirm('board','Above the 80th percentile of successful Class XII candidates in your stream'),confirm('regularDegree','In a recognized regular degree course and meet fresh-application rules'),confirm('noScholarship','No other scholarship or fee reimbursement')],
    ['Class XII marks record','Family income certificate','Admission and institution details','Identity and bank details requested on NSP'],
    ['Check the current PM-USP notice on the National Scholarship Portal.','Complete registration and submit the scheme application.','Track institution and nodal verification in the portal.']],
  ['pmkisan','PM-KISAN Samman Nidhi','Farmers','India','₹6,000 per year in three instalments for eligible landholding farmer families.',
    'farm farmer agriculture land farmers farming crop small రైతు రైతులకు వ్యవసాయం किसान खेती किसानों',
    'https://pmkisan.gov.in/','https://pmkisan.gov.in/',
    [confirm('land','Cultivable land recorded for the farmer family'),confirm('kisanExclusions','Family meets the official exclusion rules')],
    ['Land ownership records','Identity and e-KYC details','Bank account details'],
    ['Review the official exclusions.','Open New Farmer Registration and complete e-KYC.','Use Know Your Status to track verification.']],
  ['pmfby','Pradhan Mantri Fasal Bima Yojana','Farmers','India','Crop insurance for notified crops and areas, subject to seasonal terms.',
    'farm farmer agriculture farmers farming crop insurance harvest రైతు పంట బీమా किसान फसल बीमा खेती',
    'https://www.pmfby.gov.in/','https://www.pmfby.gov.in/',
    [confirm('crop','Crop and area are notified for the current season'),confirm('insurable','Meet the seasonal insurable-interest and enrollment conditions')],
    ['Identity and bank details','Land, tenancy or insurable-interest records','Crop and sowing details specified in the notification'],
    ['Check the crop calendar, premium and closing date for your area.','Use Farmer Corner to enroll.','Save the acknowledgment and track the application.']],
  ['kmy','PM Kisan Maandhan Yojana','Farmers','India','Contributory pension of ₹3,000 per month from age 60 for eligible farmers.',
    'farm farmer farmers farming pension land రైతు వ్యవసాయం పెన్షన్ किसान खेती पेंशन',
    'https://egazette.gov.in/WriteReadData/2023/246007.pdf','https://maandhan.in/',
    [age(18),rule('age','max',40,'Entry age no older than 40'),confirm('smallHolding','Eligible cultivable landholding of up to two hectares'),confirm('kmyRules','Meet the scheme’s remaining enrollment and exclusion rules')],
    ['Landholding record','Identity details','Savings bank details'],
    ['Review enrollment and contribution rules.','Use the Maandhan portal or ask a Common Service Centre about enrollment.','Keep the enrollment receipt.']],
  ['ignoaps','Indira Gandhi National Old Age Pension Scheme','Senior citizens','India','Monthly pension assistance under the National Social Assistance Programme.',
    'older senior elderly pension old age grandfather grandmother వృద్ధాప్య పెన్షన్ వృద్ధులు वृद्ध बुजुर्ग पेंशन',
    'https://rural.gov.in/sites/default/files/NSAP_Guidelines_English.pdf','https://nsap.nic.in/',
    [age(60),confirm('bpl','Household qualifies under the applicable Below Poverty Line criteria')],
    ['Age proof','BPL household proof','Local authority’s application and supporting documents'],
    ['Confirm your state or local body’s intake procedure.','Submit your application and supporting evidence to the designated authority.','Keep a reference for status enquiries.']],
  ['vayvandana','Ayushman Vay Vandana Card','Senior citizens','India','Hospitalization coverage for eligible people aged 70 and older under AB-PMJAY.',
    'senior elderly health hospital insurance ayushman ఆరోగ్యం వృద్ధులు अस्पताल इलाज आयुष्मान बुजुर्ग',
    'https://nha.gov.in/img/resources/English_FAQs_related_to_the_benefits_for_senior_citizens.pdf','https://beneficiary.nha.gov.in/',
    [age(70),confirm('aadhaarAge','Age is established through Aadhaar-based e-KYC')],
    ['Aadhaar for e-KYC'],
    ['Open the NHA beneficiary portal or Ayushman app.','Complete the senior citizen enrollment and e-KYC flow.','Download the card when it is issued.']],
  ['vishwakarma','PM Vishwakarma','Workers','India','Training, toolkit assistance and credit support for eligible traditional artisans.',
    'artisan carpenter tailor craftworker worker loans work కళాకారులు వృత్తి कारीगर दर्जी शिल्पकार',
    'https://www.dcmsme.gov.in/PMV-Ebook/PMV.pdf','https://pmvishwakarma.gov.in/',
    [age(18),confirm('trade','Self-employed in a listed traditional trade in the informal sector'),confirm('tradeRules','Meet family, government-service and previous-loan conditions')],
    ['Aadhaar','Mobile number','Bank details','Family details requested at enrollment'],
    ['Check the list of eligible trades.','Visit a Common Service Centre for Aadhaar-based registration.','Follow the local and district verification process.']],
  ['ujjwala','Pradhan Mantri Ujjwala Yojana','Households','India','LPG connection assistance for eligible adult women in poor households.',
    'gas lpg household cooking ujjwala గ్యాస్ వంట गैस रसोई उज्ज्वला',
    'https://www.pmuy.gov.in/Ujjwala2.html','https://www.pmuy.gov.in/Ujjwala2.html',
    [age(18),confirm('adultWoman','Applicant is an adult woman in an eligible poor household'),confirm('noLpg','No existing LPG connection in the household')],
    ['KYC form and deprivation declaration','Aadhaar and family composition proof as applicable','Bank details'],
    ['Review the Ujjwala 2.0 requirements.','Choose a distributor and submit the application.','Follow the distributor’s verification instructions.']],
  ['solar','PM Surya Ghar: Muft Bijli Yojana','Households','India','Central financial assistance for eligible residential rooftop solar installations.',
    'solar rooftop electricity bill household panel విద్యుత్ సౌర बिजली सौर',
    'https://www.pmindia.gov.in/en/news_updates/cabinet-approves-pm-surya-ghar-muft-bijli-yojana-for-installing-rooftop-solar-in-one-crore-households/','https://pmsuryaghar.gov.in/',
    [confirm('solarHome','Residential electricity connection and suitable rooftop'),confirm('solarRules','Meet the portal’s subsidy and installation requirements')],
    ['Electricity bill or consumer number','Bank information for subsidy','Installation and inspection documentation required by the portal'],
    ['Register with your electricity connection details.','Follow portal instructions for installation through a registered vendor and inspection.','Submit the subsidy claim when the commissioning steps are complete.']],
].map(([id,name,category,region,benefit,keywords,source,portal,rules,documents,steps]) => ({
  id,name,category,region,benefit,keywords,source,portal,rules,documents,steps,verified:'2026-11-23',
  application: id === 'csss'
    ? { status: 'confirmed', cycle: '2026–27 fresh student applications', opens: '2026-06-02', closes: '2026-11-30', source: 'https://scholarships.gov.in/All-Scholarships' }
    : { status: 'unconfirmed' }
}));

export const categories = [...new Set(schemes.map(scheme => scheme.category))];
export const epassIncomeLimits = { SC: 250000, ST: 200000, BC: null, EBC: null, Minority: null, 'Disabled Welfare': 100000 };
export const states = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export function search(query = '', category = '', state = '') {
  const normalized = query.toLowerCase().normalize('NFC').trim();
  const words = normalized.replace(/scholarships/g, 'scholarship').replace(/pensions/g, 'pension').split(/[^\p{L}\p{M}\p{N}]+/u).filter(word => word.length >= 3 && !['scheme','schemes','national','government','yojana','pradhan','mantri','for','the','and'].includes(word));
  return schemes.filter(scheme => (!category || scheme.category === category) &&
    (!state || scheme.region === 'India' || scheme.region === state)).map(scheme => {
    const names = (scheme.name + ' ' + scheme.id).toLowerCase();
    const index = new Set((names + ' ' + scheme.keywords).split(/[^\p{L}\p{M}\p{N}]+/u));
    const score = words.reduce((total, word) => total + (index.has(word) ? (names.includes(word) ? 3 : 1) : 0), 0);
    return { scheme, score: normalized && names.includes(normalized) ? score + 10 : score };
  }).filter(item => !normalized || item.score > 0).sort((a,b) => b.score - a.score).map(item => item.scheme);
}

export function evaluate(scheme, profile) {
  const matched = [], failed = [], missing = [];
  for (const { field, operator, value, label } of scheme.rules) {
    const answer = profile[field];
    if (operator === 'epassIncome') {
      const category = profile.welfareCategory;
      if (!category) { missing.push('ePASS welfare category'); continue; }
      if (!Object.hasOwn(epassIncomeLimits, category)) { failed.push('Eligible ePASS welfare category'); continue; }
      let limit = epassIncomeLimits[category];
      if (limit === null && !profile.residence) { missing.push('Rural or urban residence for the ePASS income limit'); continue; }
      limit ??= profile.residence === 'Rural' ? 150000 : 200000;
      const condition = 'Annual family income of ₹' + limit.toLocaleString('en-IN') + ' or less';
      (answer == null ? missing : answer <= limit ? matched : failed).push(condition);
      continue;
    }
    if (answer === undefined || answer === '' || answer === null) {
      missing.push(label);
      continue;
    }
    const passes = operator === 'min' ? answer >= value : operator === 'max' ? answer <= value : answer === value;
    (passes ? matched : failed).push(label);
  }
  return { scheme, matched, failed, missing, status: failed.length ? 'Does not meet listed conditions' : missing.length ? 'More information needed' : 'Potential match' };
}
