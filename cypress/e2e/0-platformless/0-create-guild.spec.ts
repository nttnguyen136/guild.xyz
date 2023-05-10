before(() => {
  cy.disconnectMetamaskWalletFromAllDapps()
})

describe("without wallet", () => {
  before(() => {
    cy.visit("/create-guild")
  })

  it("shows connect wallet modal", () => {
    cy.getByDataTest("platforms-grid").within(() => {
      cy.get("div[role='group']").first().click()
    })
    cy.getByDataTest("wallet-selector-modal")
      .should("exist")
      .within(() => {
        cy.get("button[aria-label='Close']").click()
      })

    cy.findByText("Create guild without platform").click()
    cy.getByDataTest("wallet-selector-modal").should("exist")
  })
})

describe("with wallet", () => {
  before(() => {
    cy.visit("/create-guild")
    cy.connectWallet()
  })

  it("can create a guild without platform", () => {
    cy.findByText("Create guild without platform").click()
    cy.get("div[aria-current='step']").should("contain.text", "2")

    cy.findByText("Start from scratch").click({ force: true })
    cy.get("div[aria-current='step']").last().should("contain.text", "Basic")
    cy.findByText("Growth").click({ force: true })
    cy.get("div[aria-current='step']").last().should("contain.text", "Growth")

    cy.findByText("Next").click()

    cy.get("input[name='name']").focus().blur()
    cy.get("input[name='name'] ~ .chakra-collapse")
      .should("exist")
      .contains("This field is required")
    cy.getByDataTest("create-guild-button").should("be.disabled")
    cy.get("input[name='name']").type(
      `${Cypress.env("platformlessGuildName")} ${Cypress.env("DEPLOYMENT_ID")}`
    )
    cy.getByDataTest("create-guild-button").should("be.disabled")

    cy.get("input[name='socialLinks.TWITTER']").focus().blur()
    cy.get("input[name='socialLinks.TWITTER']")
      .parent()
      .siblings(".chakra-collapse")
      .contains("This field is required")
    cy.getByDataTest("create-guild-button").should("be.disabled")
    cy.get("input[name='socialLinks.TWITTER']").type("guild.xyz")
    cy.get("input[name='socialLinks.TWITTER']")
      .parent()
      .siblings(".chakra-collapse")
      .contains("Invalid Twitter URL")
    cy.getByDataTest("create-guild-button").should("be.disabled")
    cy.get("input[name='socialLinks.TWITTER']").clear().type("twitter.com/guildxyz")
    cy.getByDataTest("create-guild-button").should("be.enabled")

    cy.getByDataTest("create-guild-button").click()

    cy.intercept("POST", `${Cypress.env("guildApiUrl")}/guild`).as(
      "createGuildRequest"
    )
    cy.wait("@createGuildRequest").its("response.statusCode").should("eq", 201)
  })
})

export {}
