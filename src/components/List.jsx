import React from 'react'
import UserInfo from './UserInfo'
import ChatList from './ChatList'

function List() {
  return (
	<div className='list flex flex-col gap-4 flex-1 p-5'>
	  <UserInfo />
	  <ChatList />
	</div>
  )
}

export default List
