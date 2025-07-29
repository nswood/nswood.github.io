---
layout: single
title: "Curriculum Vitae"
permalink: /cv/
author_profile: true
---

My full CV is available as a [PDF]({{ '/files/cv.pdf' | relative_url }}).

### Selected Publications
<ul>
{% for post in site.publications reversed %}
  {% include archive-single-cv.html %}
{% endfor %}
</ul>

### Selected Talks
<ul>
{% for post in site.talks reversed %}
  {% include archive-single-talk-cv.html %}
{% endfor %}
</ul>
