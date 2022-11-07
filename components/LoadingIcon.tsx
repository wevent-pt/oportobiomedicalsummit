import * as React from 'react'

import cs from 'classnames'

import styles from './styles.module.css'

export const LoadingIcon = (props) => {
  const { className, ...rest } = props
  return (
    <svg
      className={cs(styles.loadingIcon, className)}
      {...rest}
      viewBox='0 0 24 24'
    >
    </svg>
  )
}
