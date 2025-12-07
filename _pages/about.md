---
layout: home
permalink: /
title: ""
author_profile: false
redirect_from:
  - /about/
  - /about.html
---

<div id="quantum-foam-header" style="position: relative; width: 100%; height: 280px; margin-bottom: 1.5em; border-radius: 8px; overflow: hidden;">
  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(26, 26, 46, 0.85); padding: 0.8em 1.5em; border-radius: 6px; z-index: 10; border: 1px solid rgba(100, 180, 220, 0.3); text-align: center;">
    <h1 style="margin: 0; color: #fff; font-size: 1.6em; font-weight: 300; letter-spacing: 0.08em; white-space: nowrap;">Nate S. Woodward</h1>
    <p style="margin: 0.4em 0 0 0; color: rgba(100, 180, 220, 0.9); font-size: 0.9em; font-weight: 300; letter-spacing: 0.1em;">ML + Theoretical Physics</p>
  </div>
</div>
<script src="/assets/js/quantum-foam.js"></script>

<div style="display: flex; align-items: flex-start; gap: 2em; margin-bottom: 2em; flex-wrap: wrap;">
  <div style="flex-shrink: 0;">
    <img src="/images/8B550177-F22B-488C-8244-24DA3DFCCC7A_1_105_c.jpeg" alt="Nate S. Woodward" style="width: 150px; border-radius: 50%; border: 2px solid var(--global-border-color);">
  </div>
  <div style="flex: 1; min-width: 250px;">
    <p style="margin-top: 0;"><strong>ML & Theoretical Physics PhD student at UW - Madison, MIT Math & Physics '25</strong></p>
    <p style="margin: 0.3em 0;"><i class="fas fa-fw fa-location-dot"></i> Madison, WI</p>
    <p style="margin: 0.3em 0;"><i class="fas fa-fw fa-building-columns"></i> UW - Madison</p>
    <p style="margin: 0.3em 0;"><a href="mailto:nwoodward2@wisc.edu"><i class="fas fa-fw fa-envelope"></i> Email</a></p>
    <p style="margin: 0.3em 0;"><a href="https://scholar.google.com/citations?user=4nDrH1cAAAAJ&hl=en"><i class="ai ai-google-scholar"></i> Google Scholar</a></p>
    <p style="margin: 0.3em 0;"><a href="https://orcid.org/0000-0002-8051-7397"><i class="ai ai-orcid"></i> ORCID</a></p>
    <p style="margin: 0.3em 0;"><a href="https://github.com/nswood"><i class="fab fa-fw fa-github"></i> GitHub</a></p>
    <p style="margin: 0.3em 0;"><a href="https://www.linkedin.com/in/nswoodward"><i class="fab fa-fw fa-linkedin"></i> LinkedIn</a></p>
  </div>
</div>

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
