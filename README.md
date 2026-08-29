# Crypto Price Alert

A cryptocurrency price tracking project that evolved from a Python CLI application into a web-based cryptocurrency tracker with browser notifications.

The project uses the CoinGecko API to fetch live cryptocurrency market data and provides configurable price alerts.

## Features

### V2 - Web Crypto Tracker

- Track multiple cryptocurrencies
- Search for cryptocurrencies using the CoinGecko API
- Add and remove tracked coins
- Search within currently tracked cryptocurrencies
- Display current cryptocurrency prices
- Display 24-hour price changes
- View additional cryptocurrency details
- Set individual upper and lower price targets
- Detect `HIGH`, `LOW`, and `NORMAL` price states
- Prevent repeated notifications while a coin remains in the same state
- Send browser notifications when a coin crosses a configured price limit
- Store tracked coins and alerts using `localStorage`
- Automatically refresh cryptocurrency prices every 30 seconds
- Handle API errors
- Use a Service Worker for browser notifications

## State Tracking

Each cryptocurrency with an alert has a tracked state:

- `NORMAL`
- `HIGH`
- `LOW`

A notification is sent only when the cryptocurrency changes from one state to another.

For example:

```text
NORMAL → HIGH
````

triggers a notification.

But:

```text
HIGH → HIGH
HIGH → HIGH
HIGH → HIGH
```

does not repeatedly send notifications.

This prevents notification spam while the price remains above or below the configured limit.

## Technologies

### V2

* HTML
* CSS
* JavaScript
* CoinGecko API
* `fetch()`
* `localStorage`
* Service Workers
* Notifications API

### V1

* Python
* CoinGecko API
* `requests`
* `smtplib`
* `email`
* `time`

## How V2 Works

1. The application loads the user's tracked cryptocurrencies from `localStorage`.
2. Cryptocurrency data is fetched from the CoinGecko API.
3. The current prices are displayed as cryptocurrency cards.
4. The user can search for cryptocurrencies and add them to the tracker.
5. The user can remove tracked cryptocurrencies.
6. The user can search within the currently tracked cryptocurrencies.
7. The user can set an upper and lower price target for each tracked coin.
8. The application determines whether each coin is in a `HIGH`, `LOW`, or `NORMAL` state.
9. When the state changes to `HIGH` or `LOW`, a browser notification is sent.
10. Cryptocurrency prices are checked again every 30 seconds.

## Notifications

V2 uses a Service Worker to display browser notifications.

The user must grant notification permission before alerts can be delivered.

Notifications are triggered when an alert state changes rather than every time the application checks the price.

## Data Persistence

V2 uses browser `localStorage` to preserve:

* Tracked cryptocurrencies
* Upper price targets
* Lower price targets
* Previous alert states

This allows the user's tracked coins and alert configuration to remain after refreshing the page.

## API

Cryptocurrency market data is provided by the CoinGecko API.

The application uses the API to:

* Search for cryptocurrencies
* Fetch current prices
* Fetch 24-hour price changes
* Fetch additional market information

## Versions

### V1 - Python CLI

The original version of the project is a command-line cryptocurrency price monitor written in Python.

V1 supports:

* Monitor multiple cryptocurrencies
* Fetch USD and INR prices
* Display 24-hour price changes
* Set upper and lower price limits
* Detect `HIGH`, `LOW`, and `NORMAL` price states
* Send email alerts when a coin crosses a configured limit
* Automatically check prices every 20 seconds
* Handle API errors and empty responses

V1 uses email notifications and runs entirely from the command line.

### V2 - Web Crypto Tracker

V2 moves the project from the command line to a web application.

It adds:

* Web-based user interface
* Cryptocurrency search
* Dynamic cryptocurrency cards
* Multiple cryptocurrency tracking
* Per-coin price alerts
* `localStorage` persistence
* Service Worker notifications
* Browser notifications
* Automatic price updates every 30 seconds
* API error handling

### V3 - Planned

V3 is planned to introduce background price checking.

The goal is to allow cryptocurrency monitoring and notifications to continue even when the user is not actively using the website.

Planned components include:

* Background price monitoring
* Push notifications
* Backend or background services
* Persistent alert monitoring
* More reliable notification delivery

V3 is not implemented yet.

## Version Status

| Version | Status    | Main Focus                                 |
| ------- | --------- | ------------------------------------------ |
| `V1`    | Completed | Python CLI + Email Alerts                  |
| `V2`    | Completed | Web Tracker + Browser Notifications        |
| `V3`    | Planned   | Background Monitoring + Push Notifications |

## Future Improvements

* Background price monitoring
* Push notification support
* Cryptocurrency price charts
* More configurable alert conditions
* Support for additional currencies
* Improved responsive design
* Better API rate-limit handling
* More detailed cryptocurrency market information

## License

This project is intended for learning and personal development.

```
```
