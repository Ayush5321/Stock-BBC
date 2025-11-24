// import React, { useEffect, useState } from "react";
// import NavChartCompare from "./NavChartCompare";
// import axios from "axios";
// import BASE_URL from "../config";

// const FundComparison = ({ baseSchemeCode, baseSchemeName }) => {
//   const [compareFunds, setCompareFunds] = useState([
//     {
//       schemeCode: "119609", // TODO: replace with actual
//       schemeName: "SBI Bluechip Fund",
//     },
//     {
//       schemeCode: "129052",
//       schemeName: "ICICI Prudential Bluechip Fund",
//     },
//   ]);

//   const [allSchemes, setAllSchemes] = useState([]);
//   const [selectedSchemeCodes, setSelectedSchemeCodes] = useState([]);
//   const [selectedSchemeNames, setSelectedSchemeNames] = useState([]);

//   useEffect(() => {
//     const selected = [
//       { schemeCode: baseSchemeCode, schemeName: baseSchemeName },
//       ...compareFunds,
//     ];
//     setSelectedSchemeCodes(selected.map((f) => f.schemeCode));
//     setSelectedSchemeNames(selected.map((f) => f.schemeName));
//   }, [baseSchemeCode, baseSchemeName, compareFunds]);

//   return (
//     <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border mt-10">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4">
//         Compare with Similar Funds
//       </h3>

//       <div className="mb-6 text-sm text-gray-600">
//         <p className="mb-1">
//           This chart shows the normalized NAV growth trend (indexed to 100) so
//           you can fairly compare percentage-based performance, regardless of the
//           original NAV value.
//         </p>
//       </div>

//       <div className="h-[300px] mb-6">
//         <NavChartCompare
//           schemeCodes={selectedSchemeCodes}
//           schemeNames={selectedSchemeNames}
//           timeRange="1Y"
//         />
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-sm text-left">
//           <thead className="text-xs text-gray-500 bg-gray-50">
//             <tr>
//               <th className="p-2">Fund Name</th>
//               <th className="p-2 text-center">Scheme Code</th>
//             </tr>
//           </thead>
//           <tbody>
//             {compareFunds.map((fund, idx) => (
//               <tr key={fund.schemeCode} className="border-b">
//                 <td className="p-2 text-gray-800">{fund.schemeName}</td>
//                 <td className="p-2 text-center text-gray-700">
//                   {fund.schemeCode}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default FundComparison;
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../config";
import NavChartCompare from "./NavChartCompare";

const FundComparison = ({ baseSchemeCode, baseSchemeName }) => {
  const [compareFunds, setCompareFunds] = useState([]);
  const [allFunds, setAllFunds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFunds, setFilteredFunds] = useState([]);

  const [selectedSchemeCodes, setSelectedSchemeCodes] = useState([]);
  const [selectedSchemeNames, setSelectedSchemeNames] = useState([]);

  // Step 1: Fetch all mutual funds across AMCs
  useEffect(() => {
    const fetchAllFunds = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/mutual-fund/filter`);
        const amcCodes = Object.values(res.data.amc_codes);
        const fundPromises = amcCodes.map((code) =>
          axios.get(`${BASE_URL}/mutual-fund/filter`, { params: { amc_code: code } })
        );

        const results = await Promise.allSettled(fundPromises);
        const all = results
          .filter((r) => r.status === "fulfilled")
          .flatMap((r) => r.value.data.mutual_funds || []);
        setAllFunds(all);
      } catch (err) {
        console.error("Error fetching mutual funds:", err);
      }
    };

    fetchAllFunds();
  }, []);

  // Step 2: Setup chart data on fund change
  useEffect(() => {
    const selected = [
      { scheme_code: baseSchemeCode, scheme_name: baseSchemeName },
      ...compareFunds,
    ];
    setSelectedSchemeCodes(selected.map((f) => f.scheme_code));
    setSelectedSchemeNames(selected.map((f) => f.scheme_name));
  }, [baseSchemeCode, baseSchemeName, compareFunds]);

  // Step 3: Filter funds by search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = allFunds.filter((f) =>
        f.scheme_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFunds(filtered.slice(0, 5)); // limit to 5 suggestions
    } else {
      setFilteredFunds([]);
    }
  }, [searchTerm, allFunds]);

  // Step 4: Add fund to comparison
  const handleAddFund = (fund) => {
    if (compareFunds.find((f) => f.scheme_code === fund.scheme_code)) return;
    if (compareFunds.length >= 2) {
      alert("You can compare with a maximum of 2 funds.");
      return;
    }
    setCompareFunds([...compareFunds, fund]);
    setSearchTerm("");
    setFilteredFunds([]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border mt-10">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Compare with Similar Funds
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        Search and select up to 2 funds to compare with{" "}
        <strong>{baseSchemeName}</strong>.
      </p>

     {/* Search Input + Reset Button */}
<div className="mb-6 flex gap-2 relative">
  <div className="flex-1 relative">
    <input
      type="text"
      placeholder="Search mutual funds..."
      className="w-full p-2 border border-gray-300 rounded-lg"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    {filteredFunds.length > 0 && (
      <ul className="absolute z-10 bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto w-full shadow-lg">
        {filteredFunds.map((fund) => (
          <li
            key={fund.scheme_code}
            onClick={() => handleAddFund(fund)}
            className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
          >
            {fund.scheme_name}
          </li>
        ))}
      </ul>
    )}
  </div>
  <button
    onClick={() => {
      setSearchTerm("");
      setFilteredFunds([]);
       setCompareFunds([]);
    }}
    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
  >
    Reset
  </button>
</div>


      <div className="h-[300px] mb-6">
        <NavChartCompare
          schemeCodes={selectedSchemeCodes}
          schemeNames={selectedSchemeNames}
          timeRange="1Y"
        />
      </div>

      {/* Selected Funds Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50">
            <tr>
              <th className="p-2">Fund Name</th>
              <th className="p-2 text-center">Scheme Code</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2 text-gray-800">{baseSchemeName}</td>
              <td className="p-2 text-center text-gray-700">
                {baseSchemeCode}
              </td>
            </tr>
            {compareFunds.map((fund) => (
              <tr key={fund.scheme_code} className="border-b">
                <td className="p-2 text-gray-800">{fund.scheme_name}</td>
                <td className="p-2 text-center text-gray-700">
                  {fund.scheme_code}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FundComparison;
