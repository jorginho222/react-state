import React, {createContext, useCallback, useContext, useEffect, useMemo, useReducer,} from "react";
import {useQuery} from "@tanstack/react-query";
interface Pokemon {
  id: number,
  name: string,
  type: string[],
  hp: number,
  attack: number,
  defense: number,
  special_attack: number,
  special_defense: number,
  speed: number
}

function usePokemonSource(): {
  pokemon: Pokemon[],
  search: string,
  setSearch: (search: string) => void
} {

  const { data: pokemon } = useQuery<Pokemon[]>(
    ['pokemon'],
    () => fetch('/pokemon.json').then(response => response.json()),
    { initialData: [] }
  )

  type PokemonState = {
    search: string
  }

  type PokemonAction = {type: 'setSearch', payload: string}

  const[{search}, dispatch] = useReducer((state: PokemonState, action: PokemonAction) => {
    switch (action.type) {
      case "setSearch":
        return { ...state, search:action.payload }
    }
  }, {
    search: ''
  })

  const setSearch = useCallback((search: string) => {
    dispatch({
      type: 'setSearch',
      payload: search
    })
  }, [])

  const filteredPokemon = useMemo(() => {
    return pokemon.filter(p => p.name.toLowerCase().includes(search)).slice(0, 20)
  }, [pokemon, search])

  const sortedPokemon = useMemo(() =>
    [...filteredPokemon].sort((a, b) => a.name.localeCompare(b.name)
  ), [filteredPokemon])

  return { pokemon: sortedPokemon, search, setSearch }
}

const PokemonContext = createContext<ReturnType<typeof usePokemonSource>>(
  {} as unknown as ReturnType<typeof usePokemonSource>
)

// eslint-disable-next-line react-refresh/only-export-components
export function usePokemon() {
  return useContext(PokemonContext)
}

export function PokemonProvider({children}: {children: React.ReactNode}) {
  return (
    <>
      <PokemonContext.Provider value={usePokemonSource()}>
        {children}
      </PokemonContext.Provider>
    </>
  )
}