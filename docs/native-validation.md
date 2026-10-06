# Native end-to-end validation

This checklist separates successful native bundling from interaction on the target native runtime. Phase 6 requires the complete flow on at least one physical device or simulator; any additional platform without runtime evidence must be identified as untested.

## Runtime setup

1. Connect the development computer and phone to the same trusted Wi-Fi network.
2. Start the backend on `0.0.0.0` with a local database and a chosen port.
3. Set `EXPO_PUBLIC_AWAIR_API_URL` to the computer's LAN address.
4. Start Expo with `--lan` and open the QR code in Expo Go.
5. Confirm that the About screen displays the expected LAN API address.

## Acceptance checklist

- the original AWAIR splash and application identity render correctly;
- first launch opens onboarding and continues to the prediction form;
- invalid input shows field-specific feedback without sending a request;
- valid input reaches the local API and returns AQI, category, six pollutants, and model version;
- history contains the same persisted record and detail contains its original inputs;
- retry after a failed request does not create a duplicate record;
- cached history remains readable when the backend becomes unavailable;
- a new prediction is disabled or fails clearly while offline;
- restarting the application retains onboarding state and cached history;
- content remains readable with the software keyboard open and on the tested screen size.

## Evidence to record

For each tested runtime, record the device or simulator, operating-system version, Expo Go version, API address, completed flows, failures, and fixes. Console output alone does not prove a user-visible flow; the tester must confirm the rendered result on the native screen.

Public deployment, store packaging, identity accounts, and health validation remain outside this local portfolio product's definition of done.
