# HTML templates for Email alerts

These are the Jinja templates used for sending email alerts.

## Notes for contributing/making changes to these files

- All CSS styles must be inlined to each HTML element. Style tags are not supported well and the formatting may break when an email is forwarded or is inside a thread.
- Use [this tool](https://templates.mailchimp.com/resources/inline-css/) to automatically convert style tags to inline CSS.
    - NOTE: recheck the HTML generated from this - especially the tags that included Jinja template variables. The tool does not understand Jinja template blocks such as if, while, etc. which could lead to multiple extra closing or opening blocks being added. Also check for attributes which are assigned to a template variable.
    - TODO: find a better tool that can work with Jinja templates.
