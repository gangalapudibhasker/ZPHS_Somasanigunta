const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// Exact records from Appar Ids 29-09-2026 (1).pdf
const PDF_RECORDS = [
  // Class VI
  { class: "VI", name: "GONUPALLI VENKATESWARLU", gender: "Male", dob: "05-05-2016", mobile: "9346178312", pen: "20222720735", penAlt: "2022270735", apaar: "830252317035" },
  { class: "VI", name: "KOTHAPALLI VAISHNAVI", gender: "Female", dob: "14-11-2013", mobile: "8143113605", pen: "20509011341", apaar: "107886988400" },
  { class: "VI", name: "MANNETI VENKATADRI", gender: "Male", dob: "06-04-2016", mobile: "9550310018", pen: "20347136064", apaar: "491252157587" },
  { class: "VI", name: "NALLAGUNDLA ANJI", gender: "Male", dob: "29-12-2015", mobile: "9014085454", pen: "20677132525", apaar: "717672507203" },
  { class: "VI", name: "UYYALA THEJENDRA", gender: "Male", dob: "12-04-2016", mobile: "6300258627", pen: "20514380115", apaar: "296690586117" },
  { class: "VI", name: "VEMALA HEMANTH KUMAR", gender: "Male", dob: "01-12-2015", mobile: "6305484097", pen: "20318778827", penAlt: "20318778627", apaar: "441391158268" },

  // Class VII
  { class: "VII", name: "AMBATI ANJINI", gender: "Female", dob: "19-08-2015", mobile: "6304536004", pen: "22639234284", penAlt: "2263924284", apaar: "132174329015" },
  { class: "VII", name: "ARAVA POORNESH", gender: "Male", dob: "04-04-2015", mobile: "7569145920", pen: "20431907802", apaar: "122031675003" },
  { class: "VII", name: "BANDI AKHIL", gender: "Male", dob: "25-07-2015", mobile: "9182507992", pen: "20654250262", apaar: "786473156408" },
  { class: "VII", name: "BAPANA YEDUKONDALU", gender: "Male", dob: "18-04-2015", mobile: "7569720538", pen: "20246030538", apaar: "268820354920" },
  { class: "VII", name: "CHATA MUNI KIRAN", gender: "Male", dob: "27-05-2015", mobile: "8978451226", pen: "20913717115", apaar: "82399264485" },
  { class: "VII", name: "CHATA MUNI VARUN TEJA", gender: "Male", dob: "19-05-2015", mobile: "9177342389", pen: "20217788971", apaar: "378684583717" },
  { class: "VII", name: "DASARI CHARAN TEJA", gender: "Male", dob: "08-12-2014", mobile: "9701364939", pen: "20318774957", apaar: "368535869989" },
  { class: "VII", name: "KODURU GANESH", gender: "Male", dob: "09-09-2013", mobile: "9701845003", pen: "20304235252", apaar: "279483768532" },
  { class: "VII", name: "MADALA MAHESH", gender: "Male", dob: "24-12-2014", mobile: "8500606772", pen: "20642296453", apaar: "584228448318" },
  { class: "VII", name: "MANNETI HARIKA", gender: "Female", dob: "05-10-2015", mobile: "7993665289", pen: "20564933398", apaar: "761417704134" },
  { class: "VII", name: "MEKALA VENKATADRI", gender: "Male", dob: "01-06-2014", mobile: "8688017593", pen: "20917283774", apaar: "358803454777" },
  { class: "VII", name: "POLI KARTHIK", gender: "Male", dob: "11-04-2015", mobile: "9550393018", pen: "20246925975", apaar: "346365665599" },
  { class: "VII", name: "RAPURU MADHAVI", gender: "Female", dob: "19-01-2015", mobile: "9496080760", pen: "20277388021", apaar: "277398559714" },
  { class: "VII", name: "SANAGA MUKESH", gender: "Male", dob: "27-01-2015", mobile: "7207993417", pen: "20630854747", apaar: "612069230088" },
  { class: "VII", name: "SUREPALLI MANOJ KUMAR", gender: "Male", dob: "13-12-2014", mobile: "7893272389", pen: "20524251663", apaar: "631740140724" },
  { class: "VII", name: "THAMMISETTY AISHWARYA", gender: "Female", dob: "30-03-2015", mobile: "9618664733", pen: "20314457017", apaar: "417917506570" },
  { class: "VII", name: "THOKALA HARSHAVARDHAN", gender: "Male", dob: "11-08-2015", mobile: "7093458508", pen: "20301447123", apaar: "188195715483" },
  { class: "VII", name: "THOKALA MAHESH", gender: "Male", dob: "02-10-2014", mobile: "9542873065", pen: "20293844558", apaar: "259166601021" },
  { class: "VII", name: "THOKALA SIVA SANKAR", gender: "Male", dob: "12-05-2015", mobile: "9059159749", pen: "20541025065", apaar: "749814962744" },
  { class: "VII", name: "UDAYAGIRI SRUJAN", gender: "Male", dob: "04-08-2015", mobile: "8639574814", pen: "20414194949", apaar: "887064984544" },
  { class: "VII", name: "UYYALA GURUSAI", gender: "Male", dob: "02-02-2015", mobile: "6303298595", pen: "20208115920", apaar: "919459657847" },
  { class: "VII", name: "VEMPULURU VENKATESWARLU", gender: "Male", dob: "04-10-2014", mobile: "879053278", pen: "20282296246", apaar: "304330918432" },
  { class: "VII", name: "YAMALA HARIBABU", gender: "Male", dob: "11-07-2015", mobile: "9618799357", pen: "20547834391", apaar: "408878437829" },
  { class: "VII", name: "YAMALA SRIVANI", gender: "Female", dob: "26-05-2015", mobile: "6300128060", pen: "20292303051", apaar: "713613769899" },
  { class: "VII", name: "YAMALA THIRUMALA BADRI", gender: "Male", dob: "28-03-2015", mobile: "9030726288", pen: "2033099958", apaar: "Not Available" },

  // Class VIII
  { class: "VIII", name: "AMBATI MUNI BALANJALI", gender: "Female", dob: "30-09-2013", mobile: "9121061873", pen: "22612349544", apaar: "727622898561" },
  { class: "VIII", name: "ARAVA CHERRY", gender: "Male", dob: "10-09-2012", mobile: "9160049406", pen: "2084366521", apaar: "660452102138" },
  { class: "VIII", name: "ARAVA NIKHILESH", gender: "Male", dob: "05-06-2014", mobile: "9989962934", pen: "2067652918", apaar: "725409336579" },
  { class: "VIII", name: "ARAVA SYAM KUMAR", gender: "Male", dob: "27-07-2013", mobile: "8885648303", pen: "20342770247", apaar: "710788508908" },
  { class: "VIII", name: "KOPPALA INDHU", gender: "Female", dob: "21-08-2014", mobile: "7093310367", pen: "2040373911", apaar: "627194198159" },
  { class: "VIII", name: "VEMULA ESWAR", gender: "Male", dob: "19-05-2014", mobile: "6305817429", pen: "20437944352", apaar: "228576133260" },

  // Class IX
  { class: "IX", name: "BOLIGALA THARUN", gender: "Male", dob: "10-12-2012", mobile: "9010192850", pen: "2039180384", apaar: "920215081435" },
  { class: "IX", name: "BOYINAPALLI NARASIMHULU", gender: "Male", dob: "04-01-2012", mobile: "9059273125", pen: "20758198157", apaar: "295799410502" },
  { class: "IX", name: "CHATA MOKSHITHA", gender: "Female", dob: "05-09-2013", mobile: "9676315975", pen: "20354240029", apaar: "263975151589" },
  { class: "IX", name: "DASARI LAKSHMI NARAYANA", gender: "Male", dob: "06-12-2011", mobile: "9959970342", pen: "20457561299", apaar: "Not Available" },
  { class: "IX", name: "KARLAGUNTA DHANUSH", gender: "Male", dob: "15-12-2012", mobile: "7993063227", pen: "20272953715", apaar: "522230162964" },
  { class: "IX", name: "KATARI BALAJI", gender: "Male", dob: "03-03-2013", mobile: "9703707845", pen: "20701038996", apaar: "849586274213" },
  { class: "IX", name: "KATARI YUVARAJ", gender: "Male", dob: "26-05-2013", mobile: "8688908706", pen: "20842254292", apaar: "852309929608" },
  { class: "IX", name: "MADALA VISHNU PRIYA", gender: "Female", dob: "07-09-2012", mobile: "8500606772", pen: "20229582591", apaar: "932703304049" },
  { class: "IX", name: "MANNETI SIVAMANI", gender: "Male", dob: "02-04-2013", mobile: "7995342762", pen: "20272663225", apaar: "443224838336" },
  { class: "IX", name: "PELLURU SURENDRA", gender: "Male", dob: "11-05-2013", mobile: "8978727146", pen: "20962815537", apaar: "829154654515" },
  { class: "IX", name: "THAMMISETTY SUPRIYA", gender: "Female", dob: "15-09-2012", mobile: "9618664733", pen: "20385350749", apaar: "454684264670" },
  { class: "IX", name: "THAMMISETTY SUSENDRA", gender: "Male", dob: "14-08-2012", mobile: "9704797217", pen: "2029788316", apaar: "Not Available" },
  { class: "IX", name: "THOKALA DINESH", gender: "Male", dob: "10-02-2013", mobile: "9542873065", pen: "20547477854", apaar: "379011240476" },
  { class: "IX", name: "THOKALA NARENDRA", gender: "Male", dob: "05-04-2013", mobile: "7093458508", pen: "20409222566", apaar: "321593257386" },
  { class: "IX", name: "UYYALA GURUSWAMY", gender: "Male", dob: "10-12-2011", mobile: "6300258627", pen: "20739274690", apaar: "267214753443" },

  // Class X
  { class: "X", name: "BANDI SUBRAMANYAM", gender: "Male", dob: "01-01-2010", mobile: "7995998740", pen: "20987703892", apaar: "395138361706" },
  { class: "X", name: "CHATA SUBRAMANYAM", gender: "Male", dob: "08-09-2012", mobile: "9121432017", pen: "20582095881", apaar: "533456291204" },
  { class: "X", name: "JAANA HEMANTH", nameAlt: "JANA HEMANTH", gender: "Male", dob: "26-05-2012", mobile: "9959108837", pen: "20582773200", apaar: "981824418202" },
  { class: "X", name: "KANTIPALLI SATHISH KUMAR", gender: "Male", dob: "29-12-2011", mobile: "8978414907", pen: "20404689011", penAlt: "2040469011", apaar: "784628037605" },
  { class: "X", name: "NAKKALA SOWMYA", gender: "Female", dob: "15-05-2012", mobile: "9701462874", pen: "20552647040", apaar: "504550572092" },
  { class: "X", name: "TALLA SUDHAKAR", gender: "Male", dob: "01-07-2011", mobile: "9391965613", pen: "20503776020", apaar: "561779425805" },
  { class: "X", name: "THOKALA AMAR", gender: "Male", dob: "12-06-2012", mobile: "7093878579", pen: "20415187902", apaar: "328031011668" },
  { class: "X", name: "THOKA VIKASH", nameAlt: "THOKALA VIKASH", gender: "Male", dob: "01-01-2010", mobile: "8978510361", pen: "20815244287", apaar: "Not Available" },
  { class: "X", name: "THURAKA BHARGAVI", gender: "Female", dob: "27-08-2012", mobile: "7093402691", pen: "20619882638", apaar: "674395427782" },
  { class: "X", name: "THAMMISETTI NANDINI", nameAlt: "TUMMISETTY NANDINI", gender: "Female", dob: "01-02-2012", mobile: "9704797217", pen: "20595866753", apaar: "939337529436" },
  { class: "X", name: "VEMULA HINDHU", nameAlt: "YAMALA HINDU", gender: "Female", dob: "13-05-2012", mobile: "8790752755", pen: "20481533841", apaar: "Not Available" },
  { class: "X", name: "YAMALA VENKATADRI", gender: "Male", dob: "10-02-2010", mobile: "9100757423", pen: "20490984623", penAlt: "2049084623", apaar: "Not Available" },
];

async function main() {
  const students = await prisma.$queryRawUnsafe(`SELECT * FROM "Student" ORDER BY "classLevel" ASC, "rollNo" ASC`);
  console.log(`Found ${students.length} students in DB.`);

  let updatedCount = 0;

  for (const s of students) {
    const match = PDF_RECORDS.find(
      (r) =>
        r.pen === s.penId ||
        (r.penAlt && r.penAlt === s.penId) ||
        r.name.toUpperCase() === String(s.name).trim().toUpperCase() ||
        (r.nameAlt && r.nameAlt.toUpperCase() === String(s.name).trim().toUpperCase())
    );

    if (!match) {
      console.warn("No PDF match found for:", s.name, s.penId);
      continue;
    }

    let extra = {};
    if (s.admissionFormData) {
      try {
        extra = JSON.parse(s.admissionFormData);
      } catch {}
    }

    const cleanApaar = match.apaar === "Not Available" ? "" : match.apaar;

    extra = {
      ...extra,
      fatherPhone: match.mobile,
      motherPhone: match.mobile,
      childInfoNo: s.penId || match.pen,
    };

    await prisma.student.update({
      where: { id: Number(s.id) },
      data: {
        dob: match.dob,
        mobileNo: match.mobile,
      },
    });

    await prisma.$executeRawUnsafe(
      `UPDATE "Student" SET "apaarId" = ?, "admissionFormData" = ? WHERE "id" = ?`,
      cleanApaar,
      JSON.stringify(extra),
      Number(s.id)
    );

    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} / ${students.length} students in SQLite.`);

  // Also update the Excel file ZPHS_Admin_Students_List_Class_ALL (3).xlsx
  const excelPath = path.join(__dirname, "../ZPHS_Admin_Students_List_Class_ALL (3).xlsx");
  if (fs.existsSync(excelPath)) {
    const wb = XLSX.readFile(excelPath);
    const sheetName = wb.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
    const updatedRows = rows.map((row) => {
      const rName = String(row["Name"] || "").trim().toUpperCase();
      const rPen = String(row["PEN ID"] || "").trim();
      const match = PDF_RECORDS.find(
        (r) =>
          r.pen === rPen ||
          (r.penAlt && r.penAlt === rPen) ||
          r.name.toUpperCase() === rName ||
          (r.nameAlt && r.nameAlt.toUpperCase() === rName)
      );
      if (match) {
        return {
          ...row,
          "Date of Birth": match.dob,
          "Mobile No": match.mobile,
          "APAAR ID": match.apaar === "Not Available" ? "" : match.apaar,
        };
      }
      return row;
    });
    wb.Sheets[sheetName] = XLSX.utils.json_to_sheet(updatedRows);
    XLSX.writeFile(wb, excelPath);
    console.log("Updated Excel file ZPHS_Admin_Students_List_Class_ALL (3).xlsx");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
