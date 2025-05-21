import CountryData from "./CountryData"
import Flag from "react-world-flags"



export const CountryFlagEmoji = ({ code, width }) => {

const getCountryFlagEmoji = (countryCode) => {
    console.log("countryCode", CountryData[countryCode]?.flag)
   return CountryData[countryCode]?.flag || "🏳️"
}
  const title = code ? CountryData[code] || code : undefined
  return (
    <span role="img" aria-labelledby={title} title={title}>
      {code ? <Flag code={getCountryFlagEmoji(code)} style={{ width: width ? width : "40px" }} /> : "🏳"}
    </span>
  )
}