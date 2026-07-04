import { useTranslation } from "react-i18next"
import { Atlas } from "../atlas/atlas"

export default function WikiAtlas() {
  const { t } = useTranslation()
  return (
    <div id="wiki-atlas">
      <Atlas />
    </div>
  )
}
