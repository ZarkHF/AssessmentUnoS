import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import { NavigationComponent } from "./components/NavigationComponent";
import { AboutPage } from "./pages/About";
import { HomePage } from "./pages/Home";

const createAppRouter = () => createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <HomePage />
            },            
            {
                path: "about",
                element: <AboutPage />
            }
        ]
    }
]);

function Layout() {
    return (
        <div className="container-fluid">
            <NavigationComponent />
            <Outlet />
        </div>
    );
}

export function App() {
    return (
        <>
            <RouterProvider router={createAppRouter()} />
        </>
    );
}
