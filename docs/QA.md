# Developer Q&A Documentation

This document serves as a gradual knowledge base for the application, addressing any doubts and summarizing answers for future reference.

## Q1: What is the purpose of the Vehicle screen?
**Answer:** 
The **Vehicle** screen (titled "My Garage") serves as a registry where users can manage the vehicles they inspect. 
- It lists all the vehicles added by the user.
- It provides a search functionality to quickly find a vehicle by its make, model, or license plate number.
- It features an "Add New Vehicle" modal to register a new vehicle with essential details (Make, Model, Year, Plate Number), which is required before conducting an inspection.
- The overarching purpose is to organize vehicles so that users can track inspection histories for each specific vehicle in one unified place.

## Q2: What is the purpose of the History (Story) screen?
**Answer:** 
The **History** screen (titled "Inspection History") allows users to track the status of all their past and ongoing inspections.
- It displays a list of inspections detailing the vehicle name, date, and current status (e.g., COMPLETED, PENDING, or DRAFT).
- It provides quick stats like the number of photos taken and the type of inspection.
- Users can click on a specific item to either view details of a completed inspection or seamlessly resume a drafted/pending inspection.
- Additionally, it features search and filtering capabilities to quickly locate a past inspection record.

## Q3: So the first step is that the user will come and register the vehicle right before conducting the inspection, right?
**Answer:**
Conceptually, **yes**. The intended workflow for the application is that the user must first register the asset (the vehicle or vessel) in the "My Garage" screen. This ensures that any subsequent inspections are linked to a specific entity, allowing the system to track the complete inspection history per vehicle over time. 

*(Note: While this is the architectural intent, in the current development state of the application, the newly added `Pre Hold Cleaning` workflow doesn't yet strictly enforce picking a registered vehicle from the garage before starting the inspection steps. However, as the app matures, registering the vehicle will logically and practically be the required first step.)*

## Q4: Shouldn't there be an option to select the vehicle from the garage before starting the inspection, since otherwise we don't know which vehicle is being inspected?
**Answer:**
Yes, absolutely. This is a critical missing piece in the current UI flow. Without selecting a vehicle first, the inspection data is essentially "orphaned" and we have no idea which vehicle the inspection belongs to. 

To solve this, we should implement a vehicle selection step. Two common ways to handle this are:
1. **Home Screen Prompt:** When the user taps an inspection type (like "Pre Hold Cleaning") on the Home screen, a modal pops up asking them to select a vehicle from their Garage (or create a new one) before proceeding.
2. **Garage-First Approach:** The user goes to the "My Garage" screen, taps on a specific vehicle, and then taps a "Start Inspection" button from that vehicle's details.

**UX Recommendation:** Option 1 (Home Screen Prompt) is highly recommended. The Home screen currently features prominent "Quick Actions" (Pre Hold Cleaning, Bunker Survey, etc.). This indicates an "Action-First" design philosophy. Users open the app knowing *what* they want to do; letting them tap the action immediately and then quickly asking "On which vehicle?" provides the least amount of friction and keeps the Home screen highly functional.

## Q5: The application needs to work offline. Is migrating to WatermelonDB a good idea?
**Answer:**
**Yes, WatermelonDB is an excellent choice** for offline-first React Native applications. 

Since the app was recently migrated to a bare React Native project (allowing for custom native modules), integrating WatermelonDB is fully supported and highly recommended for the following reasons:
1. **Performance:** It is incredibly fast because it is built on SQLite but uses a lazy-loading architecture. It doesn't load the entire database into memory, allowing it to handle thousands of inspection records smoothly.
2. **Reactivity:** It uses observables. If a vehicle's data is updated, any screen displaying that vehicle will automatically re-render with the new data without you needing to manually refresh it.
3. **Offline-First & Sync:** It is designed specifically for apps that work offline and need to sync with a remote server later. It tracks changes (creates, updates, deletes) locally and provides a built-in `sync` function to push/pull those changes to a backend when the network is restored.

**Trade-offs to consider:**
- **Setup Complexity:** It requires setting up Babel plugins and native iOS/Android modifications (via JSI), which is more complex than a basic SQLite wrapper.
- **Refactoring:** We will need to rewrite the current `databaseService` and create formal data "Models" (e.g., `Vehicle`, `Inspection`) following WatermelonDB's schema syntax.

Overall, if robust offline capability and background syncing are core requirements, the initial setup cost of WatermelonDB is absolutely worth the long-term stability and performance it provides.

*(This document will be updated gradually as more questions arise during development.)*

## Q6: What is the purpose of the files inside the `src/database` folder?
**Answer:**
The `src/database` folder contains the core architecture for WatermelonDB. It splits the database into three logical pieces:

1. **`schema.ts` (The Blueprint):**
   This file talks directly to the raw SQLite database. It defines the exact tables that need to be created (like `vehicles`, `inspections`, `photos`) and strictly defines their columns and data types (e.g., `make` is a string, `created_at` is a number). 

2. **The `models/` folder (`Vehicle.ts`, `Inspection.ts`, `Photo.ts`):**
   While `schema.ts` is for the SQLite engine, the Models are for React Native. A Model represents a single row in your database as a JavaScript object. By using decorators like `@field('make')`, it links a JavaScript property directly to a database column. This allows you to interact with data purely through JavaScript (e.g., `vehicle.make = "Toyota"`) without ever writing raw SQL queries. It also makes the data "observable" so the UI auto-updates when a Model changes.

3. **`index.ts` (The Engine):**
   This is the initialization file. It imports your `schema.ts`, imports all your `models`, and binds them to the `SQLiteAdapter`. It exports the final `database` object, which is the actual live connection used by the rest of the app (like `databaseService.ts`) to read, write, and query data.
