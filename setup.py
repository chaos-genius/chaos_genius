from setuptools import find_packages, setup

setup(
    name='chaosgenius',
    version='0.0.0',
    url='https://github.com/chaos-genius/chaos_genius',
    author='Chaos Genius Team',
    author_email='manas@chaosgenius.io',
    description='Chaos Genius: The Open-Source Business Observability Platform',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'flask',
        'click'
    ],
    entry_points='''
        [console_scripts]
        chaosgenius=chaos_genius.commands:cli
    '''
)