import React from "react"
import { useAppSelector } from "../../../hooks"
import TournamentItem from "./tournament-item"

export function TournamentMenu() {

    const tournaments = useAppSelector((state) => state.lobby.tournaments)

    const sortedTournaments = [...tournaments].sort((a, b) =>
        a.finished !== b.finished
            ? a.finished
                ? +1
                : -1
            : new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )

    return <ul className="hidden-scrollable">
        {sortedTournaments.map((t) => (
            <li key={t.id}>
                <TournamentItem tournament={t} />
            </li>
        ))}
    </ul>
}