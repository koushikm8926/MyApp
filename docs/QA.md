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

*(This document will be updated gradually as more questions arise during development.)*
