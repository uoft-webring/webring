# Dashboard

The flow of state and usage of server/client components is very unique here. `/dashboard/edit` requires a lot of interactivity and state sharing and thus to minimize performance loss it uses a context with data that is server fetched. `/dashboard/join` and `/dashboard/verify` don't use the useContext and simply call the server function to obtain the data, even though a context exists. Still there is no performance loss, even though we call the backend again for the same data, as these are server components.
