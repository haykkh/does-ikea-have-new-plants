import * as React from 'react'

declare module '*.css'

declare module 'react' {
  export interface HTMLAttributes extends React.HTMLAttributes {
    [key: string]: any
  }
}
