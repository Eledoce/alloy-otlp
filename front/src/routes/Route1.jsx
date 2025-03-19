import { useEffect, useState } from 'react'
export default function Route1() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('http://localhost:3002/users')
      .then((response) => response.json())
      .then((data) => setUsers(data))
  }, [])

  return (
    <div>
      Route1
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
