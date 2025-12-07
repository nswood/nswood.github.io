---
permalink: /
title: "Nate Woodward"
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

<div id="quantum-foam-header" style="position: relative; width: 100%; height: 250px; margin-bottom: 1.5em; border-radius: 8px; overflow: hidden;">
  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.75); padding: 1em 2em; border-radius: 8px; z-index: 10;">
    <h1 style="margin: 0; color: #fff; font-size: 2.5em; font-weight: 300; letter-spacing: 0.05em;">Nate S. Woodward</h1>
  </div>
</div>
<script src="/assets/js/quantum-foam.js"></script>

I am a PhD student at the University of Wisconsin–Madison, where I develop machine learning techniques for theoretical physics. My current research focuses on improving LLM reasoning for theoretical physics.

I graduated from MIT in 2025 with degrees in Physics and Mathematics. During my undergraduate studies I worked in Professor Phil Harris's group and with the NSF AI Institute for Artificial Intelligence and Fundamental Interactions (IAIFI), building ML tools for high‑energy physics. My experience spans geometric ML for jet physics, detector readout algorithms, and theoretical QFT calculations.

## Recent Posts

{% for post in site.posts limit:3 %}
  {% if post.title %}
- [{{ post.title }}]({{ post.url }}) ({{ post.date | date: "%Y-%m-%d" }})
  {% endif %}
{% endfor %}

## Recent Publications

{% comment %}
  1. Sort ascending by date → oldest→newest
  2. Reverse the array        → newest→oldest
  3. Then take limit:3         → three newest, in descending order
{% endcomment %}

{% assign sorted_pubs = site.publications 
     | sort: "date"
     | reverse %}

{% for post in sorted_pubs limit:3 %}
  {% if post.link %}
- [{{ post.title }}]({{ post.link }}) ({{ post.date | date: "%Y" }})
  {% elsif post.paperurl %}
- [{{ post.title }}]({{ post.paperurl }}) ({{ post.date | date: "%Y" }})
  {% else %}
- [{{ post.title }}]({{ post.url }}) ({{ post.date | date: "%Y" }})
  {% endif %}
{% endfor %}

## Recent Talks
{% assign sorted_pubs = site.talks 
     | sort: "date"
     | reverse %}

{% for post in sorted_pubs limit:3 %}
- [{{ post.title }}]({{ post.url }}) ({{ post.date | date: "%Y" }})
{% endfor %}
