const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLuyK4CeRn7azPK5NonipsptqpA6bAb4eQI7CjaoqWL0ojE1v9D4igzNR9Raw_-uhBMdsugEU1Wns6/pub?gid=272625262&single=true&output=csv';

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function generateCardsData() {
  try {
    console.log('Fetching cards data...');
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    const cards = result.data.map((row) => ({
      id: parseInt(row.ID) || 0,
      creditCardName: row.Credit_Card_Name || '',
      imageFile: row.Image_File || 'placeholder.png',
      issuer: row.Issuer || '',
      category: row.Category || '',
      annualFee: parseFloat(row.Annual_Fee?.replace(/[$,]/g, '') || '0'),
      annualFeeDisplay: row.Annual_Fee || '$0',
      annualFeeDetail: row.Annual_Fee_Detail || '',
      additionalCardFee: parseFloat(row.Additional_Card_Fee?.replace(/[$,]/g, '') || '0'),
      additionalCardFeeDisplay: row.Additional_Card_Fee || '$0',
      additionalCardFeeDetail: row.Additional_Card_Detail || '',
      purchaseInterestRate: parseFloat(row.Purchase_Interest_Rate?.replace('%', '') || '0'),
      purchaseInterestRateDisplay: row.Purchase_Interest_Rate || '',
      cashAdvanceInterestRate: parseFloat(row.Cash_Advance_Interest_Rate?.replace('%', '') || '0'),
      cashAdvanceInterestRateDisplay: row.Cash_Advance_Interest_Rate || '',
      rewardsProgram: row.Rewards_Program || '',
      welcomeBonus: row.Welcome_Bonus || '',
      welcomeBonusDetailed: row.Welcome_Bonus_Detailed || '',
      welcomeBonusValue: row.Welcome_Bonus_Value || '',
      welcomeBonusEligibility: row.Welcome_Bonus_Eligbility || '',
      features: row.Features || '',
      featuresDetailed: row.Features_Detailed || '',
      cardEligibility: row.Card_Eligibility || '',
      insurance: row.Insurance || '',
      productLink: row.Product_Link || '',
      slug: slugify(row.Credit_Card_Name || ''),
    }));

    // Generate TypeScript file that can be imported
    const tsContent = `// Auto-generated from CSV at build time
// Do not edit manually

import { CreditCard } from './types';

export const staticCards: CreditCard[] = ${JSON.stringify(cards, null, 2)};

export function getStaticCards(): CreditCard[] {
  return staticCards;
}
`;

    // Write to lib folder as TypeScript
    const libDir = path.join(__dirname, '../src/lib');
    fs.writeFileSync(
      path.join(libDir, 'cards-data-static.ts'),
      tsContent
    );
    
    // Also write JSON to public for fallback
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(publicDir, 'cards.json'),
      JSON.stringify(cards, null, 2)
    );
    
    console.log(`✅ Generated cards data with ${cards.length} cards`);
  } catch (error) {
    console.error('Error generating cards data:', error);
    process.exit(1);
  }
}

generateCardsData();
