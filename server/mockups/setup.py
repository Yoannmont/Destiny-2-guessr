import mockups.bungie_mockup

INSTALLED_MOCKUPS = set()

AVAILABLE_MOCKUPS = [mockups.bungie_mockup]


def install_mockups(mockups):
    for mockup_module in mockups:
        mockup_module.monkey_patch()
        INSTALLED_MOCKUPS.add(mockup_module.__name__)
