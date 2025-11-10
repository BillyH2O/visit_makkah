import React from 'react'

type Props = {
    label: string
}

export const Badge = ({ label }: Props) => {
  return (
    <label className={`text-md font-semibold text-center text-primary border border-primary rounded-full px-4 py-2`}>{label}</label>
  )
}