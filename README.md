# Table of Contents

- [Author](#Author)
- [Decisions](#Decisions)
- [Language](#Language)
- [Database](#Database)
- [Framework](#Framework)
- [Testing](#Testing)
- [Standards](#Standards)
- [Security](#Security)
- [Improvements](#Improvements)
- [Exercise](#Exercise)

### Author

Yari Ivan Taft

https://github.com/yaritaft/

### Decisions

- Use axios instead of superagent (Because of a Framework bug)
- Use join entities manually. Beacuse there is no documentation of how to do it in TypeORM with separate entities.

#### Language

Typescript was selected because of its interoperability with backend and frontend and its safety regarding stacic type checks.

#### Database

The database selected was postgres because It is easy to use and deploy with docker.

#### Framework

TSED was selected because of it's lightweightness, its decorators and its native object oriented concepts such as injecting services.

### How to run tests locally:

```
# in a one terminal
cat ./envdevcopy > .env
chmod 711 ./uptests.sh
./uptests.sh
# in other terminal
npm install
npm run test
```

### How to run the app locally:

```
cat ./envdevcopy > .env
chmod 711 ./up.sh
./up.sh
npm install && npm start
```

### Testing

- Integration testing is also implemented to test the whole api through rest requests.

### Code formatter and Standards

- ESLint
- Typescript
- Prettier

### Security

Security things that can be improved.

Passwords are not being stored. It is being stored the hash of a password + random salt (10 rounds). Then when the user try to log in the only thing checked is that the hash applying the same function is the same.

- JWT and sessions must be implemented to improve the authorizations. Also cognito would be useful to avoid storing the password in the database.
- Token expiration also can be applied by using cognito.
- JSON validators may be applied to validate proper data input. AJV or Yup may be good choices.

### Improvements

Things that can be improved.

- Add frontend
- Add swagger

===============================================================================

# SmartAC Proof of Concept - Specification

## Notes to Candidate:

This is a fictional project for a fictional client, but please treat the project in a realistic fashion including any communication with the team.

**LICENSE: _All resources included in this project, and communication via Slack are to be treated as confidential and cannot be shared publicly outside of this exercise; either in their original form or as derivations. You may retain a private copy for your own use only._**

## Project Summary

Our client is a manufacturer of smart air conditioning devices (SmartAC) that include either cellular modem or WIFI connectivity in order to report back their status at regular intervals to central servers for monitoring. The broader project will include all the "bells and whistles" of user and admin portals, facility management, and end-user registration; but we **are not addressing all of this for the PoC**. The main goals of the PoC are centered around the concepts that:

- a SmartAC device can register itself with the server, unattended by any user, and in a secure fashion
- a SmartAC device can send regular sensor readings to the server in a secure fashion
- these registered SmartAC devices can be seen within a secured administrative web portal
- these SmartAC device sensor readings can be viewed in an administrative web portal
  - as tabular data
  - as graphs
- the administrative portal can monitor the devices for anomalous values and
  - create alerts that are seen by users of the administrative portal
  - resolve alerts by users of the administrative portal

We have some flexibility in how to implement these features since the devices are not yet created, but we should stay within some constraints that are expected to exist in the device designs:

- Devices can talk **HTTPS** (and HTTP for local testing)
- Devices do not follow redirects (HTTP `301` or `302`)
- Device programming library has a built-in **JSON** serializer/deserializer.
- Devices can verify **JWT tokens**, and any other auth token will be treated as opaque.
- Devices treat numeric values **all** as decimals to two places (i.e. `1.00`, `2.10`, `12.01`).
- Devices know their own serial number burned into ROM and will never forget it.
- Devices know a shared registration secret burned into ROM and will never forget it.
- Devices can record and buffer data for up to about 4MB of data, and will typically send batches of data instead of individual elements of data.
- Devices cannot do much about errors returned from the server, they are Smart devices but dumb in that they have no ability to handle interaction to work around problems.
- Devices can hold other custom data of up to 2MB. This data may be lost during long power outages (that exceed battery limits) or during firmware updates. This is where they store things like auth tokens or state about what they have previously sent.

Therefore it is clear we should write a REST API that the device can talk to over HTTPS (or HTTP in development) using data in JSON. The device memory sizes we can probably safely ignore on the server-side other than ensuring any auth token sent to the device is not excessively large. Other than that, you can design the format of the JSON objects as needed.

## Features

Features fall into 3 categories, and the features are labelled with the following prefixes:

- Backend Device API (BE-DEV)
- Backend Admin API (BE-ADM)
- Frontend Admin UI (FE-ADM)

Notes about the frontend: This frontend has no specific design, nor has to be much more than "basic" (but not "ugly"). It is only be used to help demo the concepts of the PoC more visually and you can use your best judgement about the look of the UI that also fits within your skillset. Also the full details of the frontend tasks are not specified, just general descriptions.

### Backend Device API (BE-DEV)

The backend device API must allow communication with the devices (register, report status) as well as processing of the device data after it is received (validation, alerts).

#### BE-DEV-1

A device can self-register with the server (open endpoint, no auth)

> Given its own serial-number and a shared secret (known only to the device and to the server) the device can exchange this information for an auth token to be used in subsequent calls. The device will also report its firmware version during registration.

notes:

- The server should have a fixed set of devices known to it for the purposes of testing and this PoC, some 5 to 10 devices with unique secrets each should be added to the database to be used.
- A device might register more than once if it forgets its token, if it receivers a 401 error, or after a firmware update.
- We should store for each registered device:
  - the serial number (alpha numeric 24-32 characters)
  - the date of its first registration (UTC)
  - the date of the most recent registration (UTC)
  - the most recent firmware version ([semantic versioning](https://semver.org/))

#### BE-DEV-2

A device will continually report its sensor readings to the server (secure endpoint, requires auth)

> A registered device will soon after and on a continuing basis report its sensor readings to the server. This includes the **temperature**, **humidity**, **carbon monoxide**, and its overall **health status value**

notes:

- requires device auth
- A device records a snapshot of all of its sensor readings at a point in time (typically every minute).
- A device sends these readings in batches with each snapshot having its own original timestamp (UTC).
- All of the numeric readings follow the rule above of having two decimal places. The units of measurement are not part of the data and are defined implicitly by the type of reading.
  - **temperature** in Celsius (-30.00 to 100.00),
  - **humidity** as percentage (0.00 to 100.00)
  - **carbon monoxide** as parts-per-million _PPM_ (0.00 to 1000.00).
- If the numeric values are parseable as numbers, accept values even if outside of the expected ranges.
- The **health status value** is only one of the following known strings: `OK`, `needs_filter`, and `needs_service`
- Any HTTP code that is `2xx` will cause the device to interpret the call as successful and it will erase its buffer. A return of `401` will cause it to reregister and resend the data after. All other return codes will cause a resend of the same data later along with newly acquired data.
- We should store for each snapshot of readings:
  - the serial number of the device making the readings
  - the timestamp (UTC) the device recorded the reading
  - the timestamp (UTC) the server received the reading
  - the health status value
  - the individual sensor readings (temp, humidity, carbon monoxide)

#### BE-DEV-3

Received device data that is out of expected safe ranges should produce alerts.

> When data is received from a device, the data should be analyzed and determined if it is "out of range" and if so cause an alert to be created.

notes:

- data that can generated alerts are:
  - Any values that are out of the ranges specified in the requirements above (data is readable but is out of expected ranges). With alert text: _"Sensor xyz has value out of range"_ where `xyz` is one of `temperature`, `carbon monoxide`, or `humidty`
  - **Carbon Monoxide** at dangerous levels, for this PoC set the threshold value to 9.00 PPM and alert on any value higher. With alert text: _"CO value has exceeded danger limit"_
  - **Health status value** that is any other string value other than `OK`. With alert text: _"Device is reporting health problem"_
- We should store for each alert:
  - serial number of the device causing the alert
  - the timestamp (UTC) of when the server noticed the alert
  - the timestamp (UTC) of the original data that caused the alert
  - the timestamp (UTC) of when the alert is resolved (if it has been)
  - the textual alert (_examples above_)
  - a reference to the stored sensor values (or the serial number + timestamp are sufficient to find the record)
  - the view state of an alert (`new` vs. `viewed`)
  - the resolve state of the alert (`new`, `resolved`, `ignored` )

#### BE-DEV-4

Device alerts should merge and not duplicate.

> A device that enters an alert state for a given topic, should not duplicate that same alert while the alert is still unresolved (or ignored).

notes:

- requires device auth
- A device might have a data value that causes an alert repeatedly for each snapshot of sensor readings. This should not cause a new alert to be created when the previous alert is still in `new` state, or the sensor reading timestamp is within the range of a previous alert that has been resolved or ignored (snapshot timestamp is within alert's data timestamp and resolved timestamp range).
- The value causing the alert might differ from previous, but if the specific alert type is the same these are considered duplicates. Examples:
  - device reports CO PPM at 25, then 28, then 30, then 24 - are all considered the same alert of _"CO value has exceeded danger limit"_
  - device reports CO PPM at 25, which causes an alert. Then there is a temperature of -500.00 which is out of range. These are considered two different alerts and de not dedupe.
- Information should be added to the stored alert:
  - the timestamp (UTC) of the most recent data still causing the alert.
  - any other data to help with deduplication

#### BE-DEV-5

Device alerts may self resolve.

> A device that was previously in an alert status but is no longer in an alert status should resolve its own alert.

notes:

- A device which has a current alert that was not resolved can mark its own value resolved when it no longer meets the criteria for the alert that was created.
- For example, a device reports CO PPM at 25 which creates an alert, then reports a value of 28 which extends the time range of the same current alert, and then later reports CO PPM of 5 which then marks the alert as `resolved` and update the timestamp for being resolved as well.

#### BE-DEV-6

Device sensor data that does not validate must be preserved.

> A registered device might send data that is not parseable or otherwise readable, and this important information should be preserved in a log for later inspection and analysis.

notes:

- requires device auth
- A device cannot respond to errors such as "400 - bad request" for invalid data. Therefore the server should keep this data in a log (preferably the database) so that it can be later analyzed and maybe corrected if the problem is systematic and predictable (i.e. a firmware error causes temperatures to be reported with the "c" at the end of the numbers `10.02c` which prohibits valid parsing)
- You can store this in any format, since it could be unclear what data was received in these cases.
- If the data is "too large" then truncate the data to the first 500 characters.
- We should store for each un-readable report:
  - serial number of the device sending the invalid data
  - the timestamp (UTC) when server received the data
  - the raw data that was received (up to 500 characters)

#### BE-DEV-7

Devices sending a lot of invalid data should cause a new alert.

> A device that has sent significant amounts of unreadable data should cause an alert.

notes:

- requires device auth
- This is related to the previous requirement, and if a device has sent more than 500 items of invalid data since its last registration, it should cause an alert "Device sending unintelligible data".
- This alert self-resolves on a new device registration.
- This alert can be marked ignored by a user as can any alert.

### Backend Admin API (BE-ADM)

The backend administrative API is to allow a frontend to be created to visualize the activity of devices, and allow the viewing of alerts in order for them to have a human response.

#### BE-ADM-1

User Login (open endpoint).

> A user can log into the system and have an auth token

notes:

- For the PoC we can have one hard coded set of credentials and this API is more for providing the auth token for subsequent calls.

#### BE-ADM-2

User logout (secure endpoint, requires auth)

> A user can logout of the system

notes:

- requires auth

#### BE-ADM-3

List recently registered devices (secure endpoint, requires auth)

> Devices may be listed by those most recently registered in the system.

notes:

- requires auth
- data should be paged.

#### BE-ADM-4

List sensor readings for a device by date range (secure endpoint, requires auth)

> A unique device serial number has sensor readings organized in a time series, return those within the expected date range ordered by most recent to least recent.

notes:

- requires auth
- This includes the numeric sensor values (temperature, humidity, carbon monoxide) and also the health status textual value.
- Since a sensor reading is unique by "serial number + timestamp" the way to fetch a specific serial number could be via this API by providing the serial number plus a date range that has the same start/end timestamp, but that is inconvenient. It might be useful to add another endpoint to fetch a specific reading by timestamp instead of using this API.
- Absence of date range returns all data
- data should be paged.

#### BE-ADM-5

Aggregate sensor readings for a single device by date range (secure endpoint, requires auth)

> A device has sensor readings organized in a time series, and for display in graphs they should be aggregated within a date range to allow for easy use in graphs or other display models.

notes:

- requires auth
- Each sensor (temperature, humidity, carbon monoxide) are each their own series of data.
- Since there are too many points to plot for large time periods (could have 1440 or more readings per day), the data must be broken into buckets that each aggregate the values that fall within the bucket sub range of time (i.e. 60 per hour need to become just one first/last/min/max/avg)
- each aggregation period should have the first value, last value, minimum, maximum, and average values for that aggregation period.
- Our DBA has requested that since there could be hundreds of thousands of rows for a device that we do as much as possible in SQL (or whatever the database language is), and do not pull all rows in the application server. The bucketing rules below can be changed to something that is similar to make it easier in the database, use them only as a rough guideline.
- The input is a start/end date to get a date range. The aggregation granularity should be something like the following (does not need to be exact) for the common values the UI selects:
  - last 1 day - 24 buckets of 1 hours each
  - last 7 days - 28 buckets of 6 hours each
  - last 14 days - 28 buckets of 12 hours each
  - last 21 days - 28 buckets of 16 hours each
  - last 30 days - 30 buckets of 1 day each
  - last 90 days - 30 buckets of 3 days each
  - last 180 days - 30 buckets of 6 days each
- Smooth the aggregation granularity between those values (if not one of the fixed values above: divide date range hours by 28, and if <24 then use that hours as size of bucket, otherwise divide date range days by 30, and use those days as size of bucket)
- The health status value is not a sensor and is not included in this data.
- data should not be paged, but should have a limit of 100 elements

#### BE-ADM-6

List alerts active in the system (secure endpoint, requires auth)

> Active alerts in the system can be listed given their view status and resolved status.

notes:

- requires auth
- The filtering is: "all" or "unviewed" (view status is not `viewed`), "all" or "unresolved" (resolve status is not `resolved` nor `ignored`)
- Ordering is by most recent first, or oldest first
- data should be paged

#### BE-ADM-7

Alerts can be marked viewed (secure endpoint, requires auth)

> An alert can be marked viewed by setting view state in the alert to "viewed".

notes:

- requires auth

#### BE-ADM-8

Alerts can be marked ignored (secure endpoint, requires auth)

> An alert can be marked ignored by setting resolve state to "ignored" unless the state is already "resolved" in which case it cannot be changed.

notes:

- requires auth

#### BE-ADM-9

Alert data can be listed along with sensor readings.

> When listing sensor readings [BE-ADM-4](#be-adm-4) it is convenient to know if the sensor reading is related to an alert, and therefore to have that alert data.

notes:

- requires auth
- Because an alert has a start/end timestamp related to the data that caused the alert, we can enhance the endpoint that returns sensor data for a device (see requirement 2 above) to include a reference to an alert that was caused or supported by each specific sensor reading.
- The data can be a reference to the alert key (therefore another endpoint must be added to retrieve those alerts individually), or the alert data can be nested into the sensor reading data for easy viewing.

#### BE-ADM-10

Search for a device by serial number (secure endpoint, requires auth)

> A device may be found by its unique serial number. This includes primarily devices that are registered, and as a second part of the response those that have not been registered yet.

notes:

- requires auth

#### BE-ADM-11

Filter devices by registration date (secure endpoint, requires auth)

> Devices may be filtered by a range of dates in which they were registered, ordered by most recently registered to least recent for those found.

notes:

- requires auth
