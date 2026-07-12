# RestaurantOS

Version: 1.0
Status: Active Development

---

# Project Overview

RestaurantOS is a reusable restaurant website platform that will be sold to multiple restaurants around the world.

This is NOT a website for one restaurant.

The goal is to create one high-quality platform that can easily be customized for different restaurants without modifying the source code.

Restaurant owners should be able to manage their own websites through an admin dashboard called the Restaurant Control Center (RCC).

The website should feel premium, modern, elegant, fast and trustworthy.

The uploaded mockup images are the official visual reference for the project.

They define the layout, spacing, user experience and page structure.

The implementation may improve responsiveness, accessibility and usability but should preserve the overall design language.

---

# Current Development Phase

Current Phase:

Customer Website

Do NOT build the RCC yet.

Do NOT build Firebase yet.

Do NOT build authentication yet.

Do NOT build payment integrations yet.

Build only the customer-facing website.

---

# Long-Term Vision

RestaurantOS will eventually contain:

• Customer Website

• Restaurant Control Center (RCC)

• Firebase Backend

• CMS

• Authentication

• Orders

• Reservations

• Media Library

• Theme Manager

• Website Manager

• Payments

• Analytics

Everything built today should make future integration easy.

Avoid architectural decisions that will require rewriting later.

---

# Design Philosophy

The website should look premium.

Elegant.

Minimal.

Professional.

Luxury restaurant feel.

Responsive on:

Desktop

Tablet

Mobile

The uploaded mockups are references.

Do not copy them blindly.

Improve where necessary while preserving the overall appearance.

---

# Architecture Philosophy

Everything must be reusable.

Never build page-specific components if a reusable component can be created.

Prefer composition over duplication.

Avoid hardcoded values.

Avoid tightly coupled components.

Design everything as if hundreds of restaurants will eventually use it.

---

# Tech Stack

Framework

React + Vite (App Router patterns via wouter)

Note: Originally planned as Next.js. The Replit monorepo environment uses React + Vite for frontend artifacts. The architecture (pages, layouts, routing, data separation) mirrors Next.js App Router patterns and is designed for easy migration to Next.js or Vercel deployment later.

Language

TypeScript

Styling

Tailwind CSS v4

State Management

Zustand (cart, future global state)

Routing

wouter (lightweight, Next.js-compatible API)

Forms

react-hook-form + zod

Animations

framer-motion

Backend (Later)

Firebase

Database (Later)

Firestore

Authentication (Later)

Firebase Authentication

Storage (Later)

Firebase Storage

Deployment

Vercel (Preferred) — React + Vite builds are fully compatible

---

# Coding Standards

Write production-quality code.

Use strict TypeScript.

Write readable code.

Keep components small.

Avoid unnecessary complexity.

Follow clean architecture.

Keep folder names consistent.

Use descriptive variable names.

Avoid magic strings.

Create reusable utilities.

Use constants where appropriate.

Comment only when necessary.

---

# Project Structure

The project should remain modular.

Each feature should live inside its own folder.

Every page should be assembled from reusable components.

Do not mix business logic with UI.

Separate:

UI

Components

Utilities

Types

Constants

Configuration

Future Firebase logic

---

# Reusable Components

Build reusable components from the beginning.

Examples include:

Button

Input

Card

Modal

Badge

Toast

Hero

Navbar

Footer

Gallery

Menu Card

Category Card

Reservation Form

Checkout Summary

Section Container

Carousel

CTA

Image Component

These components should work with props only.

Do not hardcode restaurant information.

---

# Customer Website Pages

Current pages include:

Home

Menu

Reservations

Checkout

Locate Us

Contact

About

Hamburger Navigation

Only create additional pages if they are approved later.

---

# Data Philosophy

Every piece of content should eventually come from Firebase.

For now use mock data.

Design the data so replacing mock data with Firestore requires minimal changes.

Never hardcode:

Restaurant Name

Address

Phone Number

Email

Menu Items

Prices

Images

Opening Hours

Testimonials

Gallery

Social Links

Everything should eventually be editable from the RCC.

---

# Future Restaurant Control Center

The RCC will be developed after the customer website.

It will eventually contain:

Dashboard

Restaurant Profile

Menu Manager

Website Manager

Theme Manager

Media Library

Reservations

Orders

Payments

Settings

Help Center

The customer website should be prepared for this future integration.

---

# International Support

RestaurantOS will be sold internationally.

Support:

Multiple currencies

Multiple locales

International addresses

International phone numbers

Time zones

Different payment methods

Do not assume Nigerian businesses.

---

# Performance

The website should load quickly.

Optimize images.

Lazy load when appropriate.

Keep bundle size small.

Reuse components.

Follow accessibility best practices.

SEO should be excellent.

---

# Responsiveness

Every page must work well on:

Desktop

Tablet

Mobile

Layouts should adapt naturally.

Avoid desktop-only designs.

---

# Error Prevention

Do not continue development if build errors exist.

Fix existing errors before implementing new features.

Prefer stable architecture over rapid implementation.

---

# Development Workflow

Always:

Analyze the task.

Explain the implementation plan.

Build the feature.

Verify it compiles.

Fix any errors.

Only then continue.

---

# Future Integrations

RestaurantOS will later integrate with:

Firebase

CMS

Authentication

Payments

Apple Pay

Google Pay

Manual Bank Transfer

Order Tracking

Notifications

Email

Analytics

These integrations should not require major architectural changes.

---

# Important Rules

Treat uploaded mockup images as the official design reference.

Do not redesign the website from scratch.

Improve responsiveness only where necessary.

Every component must be reusable.

Every visible item should eventually become editable through the RCC.

Always prioritize maintainability, scalability and clean architecture.

Build RestaurantOS like a commercial SaaS product that will be sold repeatedly to restaurants around the world.

When uncertain, choose the solution that minimizes future maintenance while maximizing reusability.
